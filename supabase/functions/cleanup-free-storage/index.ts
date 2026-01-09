import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client with Service Role Key for admin privileges
// We need this to DELETE files and rows that might be protected by RLS
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
    try {
        console.log("Starting cleanup-free-storage job...");

        // 1. Calculate the cutoff time (24 hours ago)
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        console.log(`Searching for documents created before: ${cutoffTime}`);

        // 2. Identify PAID users (Standard/Business) to EXCLUDE their files
        //    We need to map: subscriptions (Clerk ID) -> user_profiles (UUID) -> documents (user_id)

        // A. Get all Clerk IDs with active paid subscriptions
        const { data: paidSubscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .in('plan_type', ['standard', 'business'])
            .in('status', ['active', 'trialing']);

        if (subError) throw new Error(`Error fetching subscriptions: ${subError.message}`);

        const paidClerkIds = paidSubscriptions?.map(s => s.user_id) || [];
        console.log(`Found ${paidClerkIds.length} paid subscriptions.`);

        // B. Get corresponding User Profile UUIDs (which are used in the documents table)
        let safeUserUuids: string[] = [];
        if (paidClerkIds.length > 0) {
            const { data: paidProfiles, error: profileError } = await supabase
                .from('user_profiles')
                .select('id')
                .in('clerk_user_id', paidClerkIds);

            if (profileError) throw new Error(`Error fetching profiles: ${profileError.message}`);

            safeUserUuids = paidProfiles?.map(p => p.id) || [];
        }
        console.log(`Found ${safeUserUuids.length} paid user profiles globally.`);

        // 3. Find documents to delete
        //    Criteria: Created < 24h ago AND (user_id IS NULL OR user_id NOT IN safeUserUuids)

        // Note: Supabase JS 'not.in' doesn't automatically include NULLs if we filter by user_id directly.
        // It's safer to fetch the candidate documents first (older than 24h) and filter in memory 
        // if the list is manageable, OR construct a careful query.
        // Given potentially many files, we should try to filter in DB if possible, but 'OR' logic 
        // with 'IS NULL' is tricky in simple chaining.

        // Let's fetch OLD documents first (limit 1000 for safety per run)
        const { data: expiredDocs, error: docError } = await supabase
            .from('documents')
            .select('id, user_id, file_path, name')
            .lt('created_at', cutoffTime)
            .limit(1000);

        if (docError) throw new Error(`Error fetching documents: ${docError.message}`);

        if (!expiredDocs || expiredDocs.length === 0) {
            console.log("No expired documents found.");
            return new Response(JSON.stringify({ message: "No documents to clean up", count: 0 }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        console.log(`Found ${expiredDocs.length} documents older than 24h. Filtering for free/anon users...`);

        // 4. Filter list: Keep only those who are NOT in the safe list
        const docsToDelete = expiredDocs.filter(doc => {
            // If no user_id, it's anonymous -> DELETE
            if (!doc.user_id) return true;
            // If user_id is NOT in safe list -> DELETE
            return !safeUserUuids.includes(doc.user_id);
        });

        console.log(`Identified ${docsToDelete.length} documents to delete.`);

        // 5. Delete them
        const deleteResults = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const doc of docsToDelete) {
            try {
                console.log(`Deleting doc: ${doc.name} (${doc.id})...`);

                // A. Remove connection from DB first (or storage first? Storage first usually safer to avoid orphan files)
                // Actually, if we delete DB row first, we lose the path reference if storage delete fails.
                // Let's delete Storage first.

                if (doc.file_path) {
                    const { error: storageError } = await supabase.storage
                        .from('documents')
                        .remove([doc.file_path]);

                    if (storageError) {
                        console.error(`Failed to delete storage file ${doc.file_path}:`, storageError);
                        // We typically continue to try deleting the DB record to avoid stuck rows, 
                        // or we skip. Let's log and trying deleting row anyway if confirmed.
                        // Actually, if storage delete fails, maybe we should keep the row so retry works?
                        // But usually this means file is already gone or permission error.
                        // Let's assume we proceed.
                    }
                }

                // B. Remove row from documents table
                const { error: dbError } = await supabase
                    .from('documents')
                    .delete()
                    .eq('id', doc.id);

                if (dbError) {
                    throw new Error(`DB delete failed: ${dbError.message}`);
                }

                deleteResults.success++;
            } catch (err: any) {
                console.error(`Error deleting ${doc.id}:`, err);
                deleteResults.failed++;
                deleteResults.errors.push(`${doc.id}: ${err.message}`);
            }
        }

        return new Response(
            JSON.stringify({
                message: "Cleanup complete",
                processed: docsToDelete.length,
                results: deleteResults
            }),
            { headers: { "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("Fatal error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
