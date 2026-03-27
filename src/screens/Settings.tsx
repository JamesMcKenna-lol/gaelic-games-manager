import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Layout } from '../components/Layout';
import { isSoundEnabled, setSoundEnabled } from '../utils/sounds';
import { Volume2, VolumeX, User, Trash2, Save } from 'lucide-react';

export const Settings: React.FC = () => {
    const { save, updateManagerName, resetCareer } = useGame();
    const navigate = useNavigate();

    const [nameInput, setNameInput] = useState(save?.managerName ?? '');
    const [nameSaved, setNameSaved] = useState(false);
    const [soundOn, setSoundOn] = useState(isSoundEnabled());
    const [confirmReset, setConfirmReset] = useState(false);

    const handleSaveName = () => {
        if (nameInput.trim()) {
            updateManagerName(nameInput.trim());
            setNameSaved(true);
            setTimeout(() => setNameSaved(false), 2000);
        }
    };

    const handleSoundToggle = () => {
        const next = !soundOn;
        setSoundOn(next);
        setSoundEnabled(next);
    };

    const handleReset = () => {
        resetCareer();
        navigate('/');
    };

    return (
        <Layout>
            <div className="max-w-lg space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Socruithe</h1>
                    <p className="text-slate-400">Settings</p>
                </div>

                {/* Manager Name */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <User size={20} />
                        </div>
                        <div>
                            <div className="font-semibold text-white">Ainm Bainistí</div>
                            <div className="text-xs text-slate-500">Manager Name</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            onClick={handleSaveName}
                            disabled={!nameInput.trim() || nameInput.trim() === save?.managerName}
                            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                            <Save size={16} />
                            <span>{nameSaved ? 'Sábháilte!' : 'Sábháil'}</span>
                        </button>
                    </div>
                </div>

                {/* Sound Effects */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${soundOn ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                                {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </div>
                            <div>
                                <div className="font-semibold text-white">Fuaimeanna</div>
                                <div className="text-xs text-slate-500">Sound Effects</div>
                            </div>
                        </div>
                        <button
                            onClick={handleSoundToggle}
                            className={`relative w-12 h-6 rounded-full transition-colors ${soundOn ? 'bg-emerald-500' : 'bg-slate-700'}`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${soundOn ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Career Info */}
                {save && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                        <div className="font-semibold text-white mb-3">Eolas Gairme — Career Info</div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Contae</span>
                            <span className="text-white font-medium">{save.teams.find(t => t.id === save.teamId)?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Cluiche</span>
                            <span className="text-white font-medium">{save.code}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Séasúr</span>
                            <span className="text-white font-medium">{save.season}</span>
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="bg-slate-900 border border-red-900/40 rounded-xl p-5 space-y-3">
                    <div className="font-semibold text-red-400">Crios Contúirteach — Danger Zone</div>
                    {!confirmReset ? (
                        <button
                            onClick={() => setConfirmReset(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-800/50 rounded-lg font-medium transition-colors"
                        >
                            <Trash2 size={16} />
                            <span>Tosaigh ó Thús — Start New Career</span>
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-red-300">An bhfuil tú cinnte? Caillfidh tú do ghairm ar fad! <span className="text-slate-500">(Are you sure? You'll lose everything.)</span></p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
                                >
                                    Tá, cinnte
                                </button>
                                <button
                                    onClick={() => setConfirmReset(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Níl, ar ais
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
