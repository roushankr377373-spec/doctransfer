import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { Activity, ShieldCheck, Clock, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

const SLASettings: React.FC = () => {
    const navigate = useNavigate();
    const { isFeatureLocked } = useSubscription();
    const isLocked = isFeatureLocked('sla_guarantee');

    if (isLocked) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>

                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} className="text-indigo-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise-Grade Reliability</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Upgrade to the Business Plan to get our 99.99% Uptime SLA Guarantee and priority credit processing.
                </p>

                <button
                    onClick={() => navigate('/pricing')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Lock size={16} />
                    Upgrade to Unlock SLA
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Status Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-white p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-bl-full -z-10 opacity-50"></div>

                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Level Status</h2>
                        <p className="text-gray-500">Real-time monitoring of our system reliability.</p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-green-200">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Operational
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <Activity size={20} className="text-indigo-500" />
                            <span className="font-medium text-sm">Target Uptime</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">99.99%</div>
                        <div className="mt-2 text-xs text-gray-400">Guaranteed by SLA</div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <Clock size={20} className="text-indigo-500" />
                            <span className="font-medium text-sm">Current Month</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">100.00%</div>
                        <div className="mt-2 text-xs text-green-600 font-medium">No downtime recorded</div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                            <CheckCircle2 size={20} className="text-indigo-500" />
                            <span className="font-medium text-sm">Last Incident</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">None</div>
                        <div className="mt-3 text-xs text-gray-400">Last 30 days</div>
                    </div>
                </div>
            </div>

            {/* Request Credit Action */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-bl-full -z-0"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-400" />
                            Experienced Downtime?
                        </h3>
                        <p className="text-indigo-200 max-w-lg">
                            If you believe we missed our SLA guarantee, you may be eligible for service credits. Requests must be submitted within 30 days of the incident.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.href = 'mailto:support@doctransfer.com?subject=SLA%20Credit%20Request'}
                        className="whitespace-nowrap px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        Request Service Credit
                    </button>
                </div>
            </div>

            {/* Terms Footer */}
            <div className="text-center text-sm text-gray-400">
                <p>Read our full <a href="#" className="text-indigo-500 hover:text-indigo-600 underline">Service Level Agreement</a> for details on credit calculation and eligibility.</p>
            </div>
        </div>
    );
};

export default SLASettings;
