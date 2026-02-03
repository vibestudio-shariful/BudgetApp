
import React, { useState, useRef } from 'react';
import { Mail, ShieldCheck, UserCheck, Code2, Camera, Settings, X, Facebook, ChevronRight, User, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface AboutProps {
  t: (key: string) => string;
  userProfile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
}

const About: React.FC<AboutProps> = ({ t, userProfile, onProfileUpdate }) => {
  const [showDevInfo, setShowDevInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile>({...userProfile});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEditing) setEditData({...editData, image: result});
        else onProfileUpdate({ ...userProfile, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    onProfileUpdate(editData);
    setIsEditing(false);
  };

  const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Shariful&backgroundColor=b6e3f4";
  const devCartoon = "https://api.dicebear.com/7.x/avataaars/svg?seed=Developer&backgroundColor=b6e3f4";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
      {/* Premium User Profile Header */}
      <div className="relative overflow-hidden bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100 text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <div className="relative inline-block group mb-6">
            <div className="relative w-32 h-32 rounded-full p-2 bg-white shadow-xl overflow-hidden ring-4 ring-indigo-50">
              <img 
                src={(isEditing ? editData.image : userProfile.image) || defaultAvatar} 
                alt="User"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-indigo-600 text-white p-3 rounded-[1.25rem] shadow-2xl border-4 border-white hover:scale-110 transition-all z-10"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          {isEditing ? (
            <div className="space-y-4 max-w-sm mx-auto">
              <input 
                type="text" 
                value={editData.name} 
                onChange={e => setEditData({...editData, name: e.target.value})}
                className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-center font-black text-slate-800"
                placeholder={t('name')}
              />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={editData.age} onChange={e => setEditData({...editData, age: e.target.value})} className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-center font-bold" placeholder={t('age')} />
                <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-center font-bold" placeholder={t('email')} />
              </div>
              <button onClick={saveProfile} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                <Save className="w-5 h-5" /> {t('save')}
              </button>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{userProfile.name}</h2>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{userProfile.email}</p>
              <div className="mt-8 flex justify-center gap-12">
                <div className="text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('age')}</p>
                  <p className="text-2xl font-black text-indigo-600">{userProfile.age || '--'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-2xl font-black text-emerald-500">Active</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">Profile Settings</h3>
        <div className="grid grid-cols-1 gap-4 px-2">
          {!isEditing && (
            <button onClick={() => { setEditData({...userProfile}); setIsEditing(true); }} className="bg-white p-6 rounded-[2rem] flex items-center justify-between hover:bg-slate-50 transition-colors border border-slate-100 group shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Settings className="w-7 h-7" /></div>
                <div className="text-left"><p className="text-slate-800 font-black text-lg">Edit Profile</p><p className="text-slate-400 text-sm font-medium">Update your account info</p></div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </button>
          )}
          <button onClick={() => setShowDevInfo(true)} className="bg-white p-6 rounded-[2rem] flex items-center justify-between hover:bg-slate-50 transition-colors border border-slate-100 group shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Code2 className="w-7 h-7" /></div>
              <div className="text-left"><p className="text-slate-800 font-black text-lg">{t('developer')}</p><p className="text-slate-400 text-sm font-medium">Meet the creator</p></div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {showDevInfo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 relative overflow-hidden animate-in zoom-in-95 duration-500 text-center">
            <button onClick={() => setShowDevInfo(false)} className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors z-20"><X className="w-5 h-5" /></button>
            <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600"></div>
            <div className="relative z-10 mt-10 space-y-6">
              <div className="w-28 h-28 rounded-3xl p-1 bg-white shadow-2xl -mt-14 mx-auto rotate-3">
                <img src={devCartoon} alt="Developer" className="w-full h-full object-cover rounded-[1.25rem]" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{t('developerName')}</h3>
                <span className="text-indigo-600 font-black text-xs uppercase tracking-widest mt-2 block">Developer</span>
              </div>
              <p className="text-slate-500 text-lg font-medium">{t('developerDesc')}</p>
              <div className="flex gap-4 w-full">
                <a href="mailto:Connect.shariful@gmail.com" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-indigo-100"><Mail className="w-5 h-5" /> Mail Me</a>
                <a href="https://fb.com/shariful.uxd" target="_blank" rel="noopener noreferrer" className="p-4 bg-[#1877F2] text-white rounded-2xl shadow-lg"><Facebook className="w-6 h-6" /></a>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-center space-y-3 pt-4"><p className="text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase">© 2024 MD. SHARIFUL ISLAM • PROJECT FINANCE PRO</p></div>
    </div>
  );
};

export default About;
