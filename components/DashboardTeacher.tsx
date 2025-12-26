
import React, { useState, useEffect } from 'react';
import { 
  Users, BarChart2, MessageSquare, ClipboardList, 
  TrendingUp, ThumbsUp, ArrowLeft, Star, Send, 
  RefreshCw, PieChart, Sparkles, Filter, Layout, Heart,
  UserPlus, Calendar, Trash2, ChevronRight, Search,
  ExternalLink, UserCheck, ShieldCheck
} from 'lucide-react';
import EvaluationRadar from './EvaluationRadar';
import { MOCK_WORKS, STORY_CONTENT } from '../constants';
import { StudentWork } from '../types';

interface RegisteredFamily {
  id: string;
  studentName: string;
  parentName: string;
  timestamp: string;
}

type TeacherView = 'overview' | 'roster';

const DashboardTeacher: React.FC = () => {
  const [view, setView] = useState<TeacherView>('overview');
  const [selectedWork, setSelectedWork] = useState<StudentWork | null>(null);
  const [registeredFamilies, setRegisteredFamilies] = useState<RegisteredFamily[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadFamilies = () => {
      const data = JSON.parse(localStorage.getItem('ai_bridge_registered_families') || '[]');
      setRegisteredFamilies(data);
    };
    loadFamilies();
    window.addEventListener('storage', loadFamilies);
    return () => window.removeEventListener('storage', loadFamilies);
  }, []);

  const clearRoster = () => {
    if (confirm('确定要清空所有已登记的家庭信息吗？此操作不可恢复。')) {
      localStorage.removeItem('ai_bridge_registered_families');
      setRegisteredFamilies([]);
    }
  };

  const classAverageStats = {
    understanding: 78,
    creation: 65,
    collaboration: 82,
    expression: 55,
    aiUsage: 90
  };

  const filteredFamilies = registeredFamilies.filter(f => 
    f.studentName.includes(searchTerm) || f.parentName.includes(searchTerm)
  );

  // --- 子页面：作品评分与点评 ---
  if (selectedWork) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] pb-24">
        <div className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b flex items-center px-4 z-50">
          <button onClick={() => setSelectedWork(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">评分：{selectedWork.studentName}</h2>
        </div>

        <div className="pt-20 px-6 max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-gray-100">
            <img src={selectedWork.imageUrl} className="w-full aspect-video object-cover" alt={selectedWork.title} />
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedWork.title}</h3>
              <p className="text-gray-500 text-sm">{selectedWork.description}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-6">教师综合评价</h4>
            <div className="space-y-4">
               <textarea placeholder="输入您的评价建议..." className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 h-32 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"></textarea>
               <button onClick={() => setSelectedWork(null)} className="w-full py-5 bg-[#1a365d] text-white rounded-[2rem] font-bold shadow-xl">提交反馈</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 子页面：家校联系名单 (这是点击“参与学生”后的独立“网页”视图) ---
  if (view === 'roster') {
    return (
      <div className="min-h-screen bg-[#fcfaf7]">
        <div className="fixed top-0 inset-x-0 h-24 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center px-8 z-50">
          <button 
            onClick={() => setView('overview')} 
            className="mr-6 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
          >
            <ArrowLeft size={24} className="text-gray-600 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">家校通讯录</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase">Real-time Directory</span>
            </div>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-0.5">Family & Student Engagement Roster</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-xs font-bold text-gray-400">当前活跃</span>
              <span className="text-lg font-black text-blue-600 leading-none">{registeredFamilies.length} 家庭</span>
            </div>
            <button 
              onClick={clearRoster}
              className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              title="清空名单"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>

        <div className="pt-32 pb-32 px-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
          {/* 高级搜索栏 */}
          <div className="bg-white p-2 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center gap-4 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <div className="p-4 bg-gray-50 rounded-full ml-2">
              <Search className="text-gray-400" size={24} />
            </div>
            <input 
              type="text" 
              placeholder="通过学生姓名、家长姓名搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent py-4 outline-none font-bold text-gray-800 text-lg placeholder:text-gray-200"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="mr-6 text-gray-300 hover:text-gray-500 font-bold">清除</button>
            )}
          </div>

          <div className="bg-white rounded-[4rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
                    <th className="px-12 py-8">档案编号</th>
                    <th className="px-12 py-8">学生姓名</th>
                    <th className="px-12 py-8">绑定家长</th>
                    <th className="px-12 py-8 text-right">初次互动时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredFamilies.length > 0 ? (
                    [...filteredFamilies].reverse().map((family, index) => (
                      <tr key={family.id} className="hover:bg-blue-50/20 transition-all group">
                        <td className="px-12 py-8">
                          <span className="font-mono text-gray-300 font-bold">#{(registeredFamilies.length - index).toString().padStart(3, '0')}</span>
                        </td>
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-200 group-hover:rotate-6 transition-transform">
                              {family.studentName[0]}
                            </div>
                            <div>
                              <span className="text-xl font-black text-gray-900 block">{family.studentName}</span>
                              <span className="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1">
                                <UserCheck size={10} /> 在线活跃
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-3 bg-orange-50/50 w-fit px-5 py-3 rounded-2xl border border-orange-100">
                            <Heart size={18} className="text-orange-500" fill="currentColor" />
                            <span className="text-gray-700 font-black">{family.parentName}</span>
                          </div>
                        </td>
                        <td className="px-12 py-8 text-right">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 text-indigo-900 font-black text-sm">
                              <Calendar size={14} className="text-indigo-300" />
                              {family.timestamp.split(' ')[0]}
                            </div>
                            <span className="text-[11px] font-bold text-gray-300 mt-1">{family.timestamp.split(' ')[1]}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-12 py-32 text-center">
                        <div className="max-w-xs mx-auto opacity-10 flex flex-col items-center">
                           <Users size={120} className="mb-6" />
                           <p className="text-2xl font-black tracking-tighter">暂无家庭数据，等待鹊桥架起</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#1a365d] p-12 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 opacity-5">
              <ShieldCheck size={300} />
            </div>
            <div className="relative z-10 text-center md:text-left">
              <h4 className="text-3xl font-black mb-3 italic">数据看板</h4>
              <p className="text-blue-200 font-medium max-w-md leading-relaxed">
                名单实时同步自家庭端登录数据。系统通过 AIGC 技术确立每对家庭的专属 ID，确保家校互动全流程可回溯。
              </p>
            </div>
            <div className="flex gap-4 relative z-10">
               <div className="bg-white/10 backdrop-blur p-6 rounded-3xl text-center border border-white/10 min-w-[120px]">
                 <p className="text-[10px] font-black uppercase text-blue-300 mb-1">总注册人数</p>
                 <span className="text-3xl font-black">{registeredFamilies.length}</span>
               </div>
               <div className="bg-white/10 backdrop-blur p-6 rounded-3xl text-center border border-white/10 min-w-[120px]">
                 <p className="text-[10px] font-black uppercase text-blue-300 mb-1">今日活跃</p>
                 <span className="text-3xl font-black">{Math.min(registeredFamilies.length, 5)}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 主页面：概览仪表盘 (首页只保留卡片统计) ---
  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-32">
      <div className="bg-[#1a365d] text-white p-12 rounded-b-[5rem] shadow-2xl relative overflow-hidden mb-16">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none -translate-y-20 translate-x-20">
           <Layout size={600} strokeWidth={0.5} />
        </div>

        <div className="flex items-center justify-between relative z-10 mb-16">
           <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <p className="text-orange-400 text-xs font-black tracking-widest uppercase">Center for Teaching Excellence</p>
              </div>
              <h1 className="text-5xl font-black tracking-tighter">教学指挥中台</h1>
           </div>
           <div className="flex gap-4">
             <button 
               onClick={() => window.location.reload()} 
               className="p-5 bg-white/10 rounded-3xl border border-white/10 hover:bg-white/20 transition-all active:scale-90"
               title="刷新实时数据"
             >
               <RefreshCw size={28} />
             </button>
             <button className="p-5 bg-orange-500 rounded-3xl shadow-2xl shadow-orange-900/40 active:scale-95 transition-transform">
               <ClipboardList size={28} />
             </button>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {/* 这里是点击进入“新网页”视图的入口 */}
          <button 
            onClick={() => setView('roster')}
            className="bg-white/10 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem] text-left hover:bg-white/20 hover:border-white/20 transition-all group relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
               <Users size={100} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500 rounded-2xl text-white">
                <Users size={24} />
              </div>
              <div className="p-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={16} />
              </div>
            </div>
            <p className="text-white/50 text-[10px] font-black tracking-widest mb-1 uppercase">参与学生</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tight">{registeredFamilies.length}</h3>
              <span className="text-xs font-bold text-blue-400">人已上线</span>
            </div>
            <div className="mt-4 flex items-center text-[10px] text-blue-300 font-bold gap-1 opacity-0 group-hover:opacity-100 transition-all">
              点击进入家校通讯录 <ChevronRight size={12} />
            </div>
          </button>

          {[
            { label: '任务进度', value: '82%', icon: TrendingUp, color: 'bg-green-500', iconColor: 'text-white' },
            { label: '待批阅', value: '12', icon: MessageSquare, color: 'bg-orange-500', iconColor: 'text-white' },
            { label: '满意度', value: '98%', icon: Heart, color: 'bg-pink-500', iconColor: 'text-white' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-xl border-2 border-white/5 p-8 rounded-[2.5rem]">
              <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4">
                <stat.icon size={24} className="text-white" />
              </div>
              <p className="text-white/50 text-[10px] font-black tracking-widest mb-1 uppercase">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-10">
          <EvaluationRadar data={classAverageStats} title="班级五维成长平均值" />
          
          <div className="bg-white p-10 rounded-[4rem] shadow-xl shadow-indigo-900/5 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <Sparkles size={24} className="text-orange-500" />
                AI 实时学情简报
              </h3>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                <p className="text-indigo-900 text-sm font-bold leading-relaxed italic">
                  “今日已有 {registeredFamilies.length} 位学生完成初步登录，‘家校协同’活跃度处于高峰。”
                </p>
              </div>
              <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100">
                <p className="text-orange-800 text-sm font-bold leading-relaxed italic">
                  “检测到大部分家长利用 AI 助手探索了‘彩锦’背后的文化内涵。”
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">亲子共创成果墙</h3>
              <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">Collaborative Works Showcase</p>
            </div>
            <div className="flex gap-3">
              <button className="p-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-colors"><Filter size={24} /></button>
              <button className="bg-indigo-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition-transform">查看全班作品集</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {MOCK_WORKS.map(work => (
              <button 
                key={work.id} 
                onClick={() => setSelectedWork(work as StudentWork)}
                className="bg-white rounded-[4rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all text-left group flex flex-col"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-8 left-8">
                    <div className="bg-white/90 backdrop-blur-xl text-indigo-900 text-[11px] font-black px-5 py-2 rounded-full shadow-2xl flex items-center gap-2">
                      <UserCheck size={14} className="text-indigo-600" />
                      {work.studentName}
                    </div>
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h4 className="font-black text-2xl text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{work.title}</h4>
                  <p className="text-sm text-gray-400 mb-8 line-clamp-2 leading-relaxed font-medium">{work.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-8 border-t border-gray-50">
                    <div className="flex gap-2">
                      {work.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">#{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-pink-500">
                      <Heart size={20} fill="currentColor" />
                      <span className="text-xl font-black">{work.likes}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTeacher;
