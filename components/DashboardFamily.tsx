import React, { useState, useEffect, useMemo } from 'react';
import { 
  Book, Palette, Video, ChevronRight, Star, Heart, 
  MessageCircle, MessageSquare, Sparkles, ArrowLeft, Gamepad2, Play, 
  Camera, CheckCircle2, Layout, BookOpen, Quote, Info, X,
  ChevronLeft, Music, Trophy, Users, FileText, Layers, Film, Volume2,
  HelpCircle, Eye, Monitor, Loader2, Mic, Zap, Lightbulb, ExternalLink, AlignLeft,
  Scissors, Wind, CloudSun, Gem, Bird, BookMarked, RefreshCw, Image as ImageIcon,
  Target, AlertCircle, Sparkle, Brush, Languages, Coffee, Sun, Compass, Plus, Trash2,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { STORY_CONTENT, EVALUATION_LABELS, EVALUATION_DETAILS } from '../constants';
import AIChatBox from './AIChatBox';
import EvaluationRadar from './EvaluationRadar';
import { generateScriptAI, explainWordWithAI, generateVisualInspiration } from '../services/geminiService';

type SubView = 'none' | 'intro_perception' | 'reading_study' | 'vocab_study' | 'card_interaction' | 'summary_extension' | 'workshop' | 'report';
type WorkshopMode = 'reading' | 'drama' | 'craft';

interface VocabItem {
  word: string;
  pinyin: string;
  desc: string;
  icon: any;
  color: string;
  isCustom?: boolean;
}

interface DashboardFamilyProps {
  studentName: string;
  parentName: string;
}

const DashboardFamily: React.FC<DashboardFamilyProps> = ({ studentName, parentName }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [subView, setSubView] = useState<SubView>('none');
  const [aiTool, setAiTool] = useState<'microscope' | 'inspiration' | null>(null);
  const [script, setScript] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [workshopMode, setWorkshopMode] = useState<WorkshopMode>('reading');
  const [workshopResult, setWorkshopResult] = useState<{text?: string, image?: string} | null>(null);
  const [isTextExpanded, setIsTextExpanded] = useState(false); // 控制正文折叠

  // 自定义词语状态
  const [customVocab, setCustomVocab] = useState<VocabItem[]>([]);
  const [isAddingVocab, setIsAddingVocab] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newPinyin, setNewPinyin] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 连连看高级状态
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [correctMatches, setCorrectMatches] = useState<string[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);
  
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const stats = {
    understanding: 88,
    creation: 75,
    collaboration: 92,
    expression: 65,
    aiUsage: 80
  };

  const STORY_SENTENCES = [
    "牛郎每天放牛，他把牛身上刷得干干净净，还总把牛棚打扫得干干净净。",
    "古时候有个孩子，爹娘都死了，跟着哥哥嫂子过日子。哥哥嫂子待他很不好。",
    "老牛开口说话了：“牛郎，明天黄昏，你翻过右边那座山，山下有一个湖，会有很多仙女在那里洗澡。”",
    "王母娘娘拔下头上的金簪，随手一划，一道波涛滚滚的天河挡住了牛郎的路。",
    "每年农历七月初七，成千上万的喜鹊搭起鹊桥，让他们在桥上相会。"
  ];

  const GAME_PAIRS = useMemo(() => [
    { id: '1', character: "牛郎", event: "相依为命", desc: "与老牛共度岁月" },
    { id: '2', character: "织女", event: "下凡寻梦", desc: "追求人间的幸福" },
    { id: '3', character: "老牛", event: "开口说话", desc: "指引牛郎去后山" },
    { id: '4', character: "王母", event: "拔簪划河", desc: "无情分开了一家人" },
    { id: '5', character: "喜鹊", event: "搭起鹊桥", desc: "银河之上的感动" },
    { id: '6', character: "嫂子", event: "待他很坏", desc: "让牛郎吃尽苦头" }
  ], []);

  const shuffledEvents = useMemo(() => {
    return [...GAME_PAIRS].sort(() => Math.random() - 0.5);
  }, [GAME_PAIRS]);

  // 本地存储同步
  useEffect(() => {
    const saved = localStorage.getItem(`custom_vocab_${studentName}`);
    if (saved) {
      try {
        setCustomVocab(JSON.parse(saved));
      } catch (e) {
        console.error("加载自定义词语失败");
      }
    }
  }, [studentName]);

  const saveCustomVocab = (list: VocabItem[]) => {
    localStorage.setItem(`custom_vocab_${studentName}`, JSON.stringify(list));
    setCustomVocab(list);
  };

  const handleManualAdd = () => {
    if (!newWord.trim() || !newPinyin.trim() || !newDesc.trim()) {
      alert("请完整填写词语、拼音和解释哦！");
      return;
    }
    const newItem: VocabItem = {
      word: newWord,
      pinyin: newPinyin,
      desc: newDesc,
      icon: BookMarked,
      color: ['text-pink-500', 'text-teal-500', 'text-orange-500', 'text-purple-500'][Math.floor(Math.random() * 4)],
      isCustom: true
    };
    saveCustomVocab([...customVocab, newItem]);
    setNewWord('');
    setNewPinyin('');
    setNewDesc('');
    setIsAddingVocab(false);
  };

  const removeVocab = (word: string) => {
    saveCustomVocab(customVocab.filter(v => v.word !== word));
  };

  const SubHeader = ({ title, colorClass = "text-indigo-900", onBack }: { title: string, colorClass?: string, onBack?: () => void }) => (
    <div className="fixed top-0 inset-x-0 h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center px-6 z-50">
      <button 
        onClick={onBack || (() => setSubView('none'))} 
        className="mr-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
      >
        <ChevronLeft size={24} className="text-gray-600 group-active:-translate-x-1 transition-transform" />
      </button>
      <div>
        <h2 className={`text-xl font-black ${colorClass}`}>{title}</h2>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">家校协同共创空间</p>
      </div>
    </div>
  );

  // --- 1. 故事导入 ---
  const IntroPerceptionView = () => {
    const steps: {
      title: string;
      icon: any;
      content: string;
      action?: string;
      videoUrl?: string;
      bg: string;
      mediaType?: string;
      question?: string;
      questions?: string[];
      image?: string;
      externalUrl?: string;
    }[] = [
      {
        title: "提问引入",
        icon: HelpCircle,
        content: "你们听说过牛郎织女的故事吗？猜猜故事可能发生在哪里，会有什么人物？",
        action: "查看导入视频",
        videoUrl: "https://www.bilibili.com/video/BV1mWt5z3EgE",
        bg: "bg-blue-50",
        mediaType: 'video'
      },
      {
        title: "音乐感知",
        icon: Music,
        content: "播放一段优美的民间音乐，闭上眼，感受故事发生的那个古老时代。",
        question: "音乐让你觉得牛郎和老牛生活是快乐还是辛苦？",
        action: "播放音乐素材",
        videoUrl: "https://www.bilibili.com/video/BV1Ba411G7Rc",
        bg: "bg-orange-50",
        mediaType: 'music'
      },
      {
        title: "美术观察",
        icon: Eye,
        content: "观察艺术作品：织女在木质织机旁，正亲手织就璀璨的星河。",
        question: "画面中的色彩让你想到了什么样的星空？",
        action: "观察浪漫意境",
        videoUrl: "https://www.bilibili.com/video/BV1Gg411y7us",
        bg: "bg-indigo-50",
        mediaType: 'video'
      },
      {
        title: "导入讲解",
        icon: Monitor,
        content: "在正式开始学习前，让我们通过一段导入讲解视频，提前熟悉传统《牛郎织女》的课堂教学内容。",
        question: "通过这段教学导引，你是否对这篇经典课文的学习目标有了更清晰认识？",
        action: "查看导入讲解视频",
        videoUrl: "https://www.bilibili.com/video/BV1okpqeEERf/?share_source=copy_web&vd_source=236e512cec5570d75d7d1428b995aa4f",
        bg: "bg-indigo-50",
        mediaType: 'video'
      }
    ];
    const cur = steps[introStep];

    const handleAction = () => {
      if (introStep < steps.length - 1) {
        setIntroStep(introStep + 1);
      } else {
        setSubView('none');
      }
    };

    return (
      <div className="min-h-screen bg-[#fdfaf5] pt-24 pb-32 px-6">
        <SubHeader title="多维感官导入" colorClass="text-indigo-900" />
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
             {steps.map((_, i) => (
               <div key={i} className={`h-2 flex-1 mx-1 rounded-full transition-all ${i <= introStep ? 'bg-indigo-600' : 'bg-gray-100'}`}></div>
             ))}
          </div>
          <div className={`p-10 rounded-[3rem] shadow-xl border-2 border-white transition-all ${cur.bg}`}>
            <div className="flex items-center gap-4 mb-8">
               <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600"><cur.icon size={32} /></div>
               <div>
                 <h3 className="text-2xl font-black text-gray-900">{cur.title}</h3>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">第 {introStep + 1} 步（共 4 步）</p>
               </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] border border-white mb-8 min-h-[160px] flex flex-col justify-center relative group">
               {cur.image && (
                 <div className="relative group/img flex flex-col items-center w-full">
                   <div className="bg-gray-900/5 rounded-2xl mb-6 shadow-inner w-full flex items-center justify-center p-2 h-[350px] md:h-[500px]">
                     <img 
                       src={cur.image} 
                       className="max-w-full max-h-full object-contain rounded-xl shadow-lg border-2 border-white/50 transition-transform group-hover/img:scale-[1.01]" 
                       alt="艺术观察" 
                     />
                   </div>
                 </div>
               )}
               <p className="text-lg font-bold text-gray-800 leading-relaxed mb-4">{cur.content}</p>
               
               {cur.videoUrl && (
                 <div className="mb-6">
                   <button 
                     onClick={() => window.open(cur.videoUrl, '_blank')}
                     className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 ${cur.mediaType === 'music' ? 'bg-orange-500 shadow-orange-100' : 'bg-blue-600 shadow-blue-100'}`}
                   >
                     {cur.mediaType === 'music' ? <Music size={20} /> : <Play size={20} />}
                     {cur.action || '点击查看素材'}
                   </button>
                 </div>
               )}

               {cur.question && <p className="text-indigo-600 font-bold italic">“{cur.question}”</p>}
            </div>

            <div className="flex gap-4">
              {introStep > 0 && (
                <button onClick={() => setIntroStep(s => s - 1)} className="flex-1 py-5 bg-white text-gray-400 rounded-2xl font-bold border border-gray-100 active:scale-95 transition-all">上一步</button>
              )}
              <div className="flex-[2] flex flex-col gap-2">
                <button 
                  onClick={handleAction}
                  className={`py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all ${introStep === steps.length - 1 ? 'px-10' : ''}`}
                >
                  {introStep < steps.length - 1 ? (
                    <>已观看，进入下一步 <ChevronRight size={18} /></>
                  ) : (
                    <><CheckCircle2 size={24} /> 完成导入，返回学习路径</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- 2. 朗读与讲解 ---
  const ReadingStudyView = () => (
    <div className="min-h-screen bg-[#fcfaf7] pt-24 pb-32 px-6">
      <SubHeader title="课文朗读与精读" colorClass="text-orange-600" />
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><AlignLeft size={32} /></div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">牛郎织女(一)</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">教材精读课文</p>
              </div>
            </div>
            <button 
              onClick={() => window.open('https://hanchacha.com/yuwen/16864969371467.html', '_blank')}
              className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all shadow-sm"
            >
              <ExternalLink size={18} /> 原文参考资料
            </button>
          </div>
          
          <div className={`prose prose-lg max-w-none text-gray-700 leading-[2.2] space-y-8 font-medium transition-all duration-700 overflow-hidden relative ${isTextExpanded ? 'max-h-[5000px]' : 'max-h-[600px]'}`}>
            <p>　　古时候有个孩子，爹妈都死了，跟着哥哥嫂子过日子。哥哥嫂子待 he 很不好，叫他吃剩饭，穿破衣裳，夜里在牛棚里睡。牛棚里没床铺，他就睡在干草上。他每天放牛。那头牛跟他很亲密，用温和的眼睛看着他，有时候还伸出舌头舔舔他的手，怪有意思的。哥哥嫂子见着他总是爱理不理的，仿佛他一在眼前，就满身不舒服。两下一比较，他也乐得跟牛一块儿出去，一块儿睡。</p>
            <p>　　他没名字，人家见他每天放牛，就叫他牛郎。</p>
            <p>　　牛郎照看那头牛挺周到。一来是牛跟他亲密;二来呢，他想，牛那么勤勤恳恳地干活，不好好照看它，怎么对得起它呢?他总是挑很好的草地，让牛吃嫩嫩的青草;家里吃的干草，筛得一点儿土也没有。牛渴了，他就牵着它到小溪的上游，让它喝干净的水。夏天天气热，就在树林里休息;冬天天气冷，就在山坡上晒太阳。他把牛身上刷得干干净净，不沾一点儿草叶、土粒。夏天，一把蒲扇不离手，把成群乱转的牛虻都赶跑了。牛棚也打扫得干干净净。在干干净净的地方住，牛舒服，自已也舒服。</p>
            <p>　　牛郎随口哼几支小曲儿，没人听他的，可是牛摇摇耳朵闭闭眼，好像听得挺有味儿。牛郎心里想什么，嘴里就说出来，没人听他的，可是牛咧开嘴，笑嘻嘻的，好像明白他的意思。他常常把看见的、听见的事告诉牛，有时候跟它商量些事。牛好像全了解，虽然没说话，可是眉开眼笑的，他也就满意了。自然，有时候他还觉得美中不足，要是牛能说话，把了解的和想说的都一五一十地说出来，那该多好呢。</p>
            <p>　　一年一年过去，牛郎渐渐长大了。哥哥嫂子想独占父亲留下来的家产，把他看成眼中钉。一天，哥哥把牛郎叫到跟前，装得很亲热的样子说：“你如今长大了，也该成家立业了。老人家留下一点儿家产，咱们分了吧。一头牛，一辆车，都归你;别的归我。”</p>
            <p>　　嫂子在旁边，三分像笑七分像发狠，说：“我们挑顶有用的东西给你，你知道吗?你要知道好歹，赶紧离开这儿。天还早，能走就走吧。”</p>
            <p>　　牛郎听哥哥嫂子这么说，想了想，说：“好，我这就走!”他想哥哥嫂子既然这样对待他，他又何必恋恋不舍呢?那辆车不稀罕，幸亏那头老牛归了他，亲密的伙伴还在一块儿，离不离开家有什么关系?</p>
            <p>　　他就牵着老牛，拉着破车，头也不回，一直往前走，走出村子，走过树林，走到山里。从那以后，他白天上山打柴，柴装满一车，就让老牛拉着，到集市上去换粮食;夜晚就让老牛在车旁边休息，自己睡在车上。过了些日子，他在山前边盖了一间草房，又在草房旁边开辟了一块地，种些庄稼，这就算安了家。</p>
            <p>　　一天晚上，他走进草房，忽然听见一声“牛郎”，他从没听见过这个声音。是谁叫他呢?回头一看，微弱的星光下，老牛嘴一张一合的，正在说话。</p>
            <p>　　老牛真会说话了!</p>
            <p>　　牛郎并不觉得奇怪，像是听惯了它说话似的，就转过身子去听。老牛说：“明天黄昏时候，你翻过右边那座山，山那边是一片树林，树林前边是个湖，那时候会有些仙女在湖里洗澡。她们的衣裳放在草地上，你要捡起那件粉红色的纱衣，跑到树林里等着，跟你要衣裳的那个仙女就是你的妻子。这个好机会你可别错过了。”</p>
            <p>　　“知道了。”牛郎高兴地回答。</p>
            <p>　　第二天黄昏时候，牛郎翻过右边的那座山，穿过树林，走到湖边。湖面映着晚霞的余光，蓝紫色的波纹晃晃荡荡。他听见有女子的笑声，顺着声音看，果然有好些个女子在湖里洗澡。他沿着湖边走，没几步，就看见草地上放着好些衣裳，花花绿绿的，件件都那么漂亮。里头果然有一件粉红色的纱衣，他就拿起来，转身走进树林。</p>
            {!isTextExpanded && (
              <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none flex items-end justify-center pb-4">
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 mt-8">
            <button 
              onClick={() => setIsTextExpanded(!isTextExpanded)}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black hover:bg-indigo-100 transition-all shadow-sm group"
            >
              {isTextExpanded ? (
                <><ChevronUp size={20} className="group-active:-translate-y-1 transition-transform" /> 收起全文</>
              ) : (
                <><ChevronDown size={20} className="group-active:translate-y-1 transition-transform" /> 展开阅读全文</>
              )}
            </button>

            <button 
              onClick={() => setSubView('none')}
              className="flex items-center gap-3 px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all group"
            >
              <CheckCircle2 size={24} />
              完成朗读，返回学习路径
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- 3. 词语精讲视图 ---
  const VocabStudyView = () => {
    const defaultVocab = [
      { word: '相依为命', pinyin: 'xiāng yī wéi mìng', desc: '互相依靠着生活，谁也离不开谁。', icon: Heart, color: 'text-red-500' },
      { word: '心意相通', pinyin: 'xīn yì xiāng tōng', desc: '彼此心里想的，不用说出来对方就能明白。', icon: Wind, color: 'text-teal-500' },
      { word: '纱衣', pinyin: 'shā yī', desc: '用轻软、透明的丝织品制成的衣服。', icon: Palette, color: 'text-pink-400' },
      { word: '金簪', pinyin: 'jīn zān', desc: '古代用来别住头发的一种金制首饰。', icon: Gem, color: 'text-yellow-500' },
      { word: '鹊桥', pinyin: 'què qiáo', desc: '传说喜鹊在银河上搭起的桥，让牛郎织女相会。', icon: Bird, color: 'text-blue-600' },
      { word: '彩锦', pinyin: 'cǎi jǐn', desc: '带有彩色花纹的丝织品，像彩虹一样美丽。', icon: Layers, color: 'text-purple-500' }
    ];

    return (
      <div className="min-h-screen bg-[#f5f7fa] pt-24 pb-32 px-6">
        <SubHeader title="词语精讲与互动" colorClass="text-indigo-600" />
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {defaultVocab.map(item => (
                 <button 
                   key={item.word}
                   onClick={() => window.open(`https://www.doubao.com/chat/${encodeURIComponent(item.word)}`, '_blank')}
                   className="bg-gray-50/50 p-8 rounded-[3rem] border-2 border-transparent hover:border-indigo-400 hover:bg-white transition-all text-left shadow-sm group flex flex-col min-h-[220px]"
                 >
                   <div className="flex items-center gap-4 mb-4">
                     <div className={`p-4 rounded-2xl bg-white shadow-sm ${item.color}`}><item.icon size={24} /></div>
                     <div className="flex flex-col">
                       <span className="text-2xl font-black text-gray-900 leading-tight">{item.word}</span>
                       <span className="text-xs font-bold text-gray-300 italic tracking-widest">{item.pinyin}</span>
                     </div>
                   </div>
                   <p className="text-sm text-gray-600 font-medium mb-6 leading-relaxed flex-1">{item.desc}</p>
                   <div className="flex items-center text-[10px] font-black text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 transition-all uppercase mt-auto">
                     点击进入深度解析 <ExternalLink size={12} />
                   </div>
                 </button>
               ))}

               {/* 自定义词语展示 */}
               {customVocab.map((item, index) => (
                 <div 
                   key={item.word + index}
                   className="bg-white p-8 rounded-[3rem] border-2 border-indigo-100 shadow-sm flex flex-col min-h-[220px] relative group"
                 >
                   <button 
                     onClick={() => removeVocab(item.word)} 
                     className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors z-10"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className="flex items-center gap-4 mb-4">
                     <div className={`p-4 rounded-2xl bg-indigo-50 ${item.color}`}><BookMarked size={24} /></div>
                     <div className="flex flex-col">
                       <span className="text-2xl font-black text-gray-900 leading-tight">{item.word}</span>
                       <span className="text-xs font-bold text-gray-300 italic tracking-widest uppercase">{item.pinyin}</span>
                     </div>
                   </div>
                   <p className="text-sm text-gray-600 font-medium mb-6 leading-relaxed flex-1">{item.desc}</p>
                   
                   <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                     <span className="text-[9px] font-black text-indigo-300 uppercase tracking-tighter">家庭自定义</span>
                     <button 
                        onClick={() => window.open(`https://www.doubao.com/chat/${encodeURIComponent(item.word)}`, '_blank')}
                        className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline transition-all uppercase"
                     >
                       深度解析 <ExternalLink size={12} />
                     </button>
                   </div>
                 </div>
               ))}

               {/* 添加生词入口卡片 */}
               <div className={`rounded-[3rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 ${isAddingVocab ? 'bg-white border-indigo-400 shadow-xl' : 'border-gray-200 text-gray-300 hover:border-indigo-200 hover:text-indigo-400'}`}>
                 {isAddingVocab ? (
                   <div className="w-full space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-indigo-600 uppercase">录入新词档案</span>
                        <button onClick={() => setIsAddingVocab(false)}><X size={16} /></button>
                      </div>
                      <input 
                        placeholder="词语 (如: 机房)" 
                        value={newWord}
                        onChange={e => setNewWord(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent focus:border-indigo-100 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                      <input 
                        placeholder="拼音 (如: jī fáng)" 
                        value={newPinyin}
                        onChange={e => setNewPinyin(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent focus:border-indigo-100 rounded-xl p-3 text-sm font-bold outline-none"
                      />
                      <textarea 
                        placeholder="用孩子能听懂的话解释..." 
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent focus:border-indigo-100 rounded-xl p-3 text-sm font-bold outline-none h-20 resize-none"
                      />
                      <button 
                        onClick={handleManualAdd}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                      >
                        保存词语并启用解析
                      </button>
                   </div>
                 ) : (
                   <button 
                     onClick={() => setIsAddingVocab(true)}
                     className="flex flex-col items-center gap-2 group"
                   >
                     <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                        <Plus size={32} />
                     </div>
                     <span className="text-sm font-black">手动添加生词档案</span>
                   </button>
                 )}
               </div>
             </div>
          </div>
          <div className="flex justify-center">
              <button 
                onClick={() => setSubView('card_interaction')}
                className="flex items-center gap-3 px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                词语掌握了，进入情节挑战 <ChevronRight size={20} />
              </button>
          </div>
        </div>
      </div>
    );
  };

  const CardInteractionView = () => {
    const handleMatch = (charId: string, eventId: string) => {
      if (charId === eventId) {
        setCorrectMatches(prev => [...prev, charId]);
        setSelectedChar(null);
      } else {
        setWrongMatch(eventId);
        setTimeout(() => setWrongMatch(null), 500);
      }
    };

    const currentSentence = STORY_SENTENCES[currentSentenceIndex];

    const handleDoubaoImage = () => {
      const doubaoUrl = `https://www.doubao.com/chat/create-image?q=${encodeURIComponent('请根据这句话画一张儿童绘本风格的插画：' + currentSentence)}`;
      window.open(doubaoUrl, '_blank');
    };

    const nextSentence = () => {
      setCurrentSentenceIndex((prev) => (prev + 1) % STORY_SENTENCES.length);
    };

    const progress = (correctMatches.length / GAME_PAIRS.length) * 100;

    return (
      <div className="min-h-screen bg-[#fcfaf7] pt-24 pb-32 px-6">
        <SubHeader title="情节挑战与生图" colorClass="text-blue-600" onBack={() => setSubView('vocab_study')} />
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-3 px-2">
               <span className="text-sm font-black text-gray-400 uppercase tracking-widest">匹配进度挑战</span>
               <span className="text-sm font-black text-blue-600">{correctMatches.length} / {GAME_PAIRS.length} 已达成</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner">
               <div 
                 className="h-full bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
          </div>

          <section className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="flex items-center gap-4 mb-12 relative z-10">
               <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl shadow-sm"><Target size={28} /></div>
               <div>
                 <h3 className="text-2xl font-black text-gray-900">乱序匹配挑战</h3>
                 <p className="text-sm text-gray-400 font-bold">先点左侧人物，再点右侧对应的情节！</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
               <div className="space-y-4">
                 {GAME_PAIRS.map((p) => (
                   <button
                     key={p.id}
                     disabled={correctMatches.includes(p.id)}
                     onClick={() => setSelectedChar(p.id)}
                     className={`w-full p-6 rounded-[2rem] text-left border-2 transition-all flex items-center justify-between group active:scale-[0.98] ${
                       correctMatches.includes(p.id) 
                         ? 'bg-green-50 border-green-200 opacity-60' 
                         : selectedChar === p.id 
                           ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]' 
                           : 'bg-white border-gray-100 hover:border-blue-400'
                     }`}
                   >
                     <span className="text-xl font-black tracking-wide">{p.character}</span>
                     {correctMatches.includes(p.id) && <CheckCircle2 size={24} className="text-green-500" />}
                   </button>
                 ))}
               </div>

               <div className="space-y-4">
                 {shuffledEvents.map((p) => (
                   <button
                     key={p.id}
                     disabled={correctMatches.includes(p.id) || !selectedChar}
                     onClick={() => selectedChar && handleMatch(selectedChar, p.id)}
                     className={`w-full p-6 rounded-[2rem] text-left border-2 transition-all group active:scale-[0.98] ${
                       correctMatches.includes(p.id) 
                         ? 'bg-green-50 border-green-200 opacity-60' 
                         : wrongMatch === p.id 
                           ? 'bg-red-50 border-red-500 animate-shake' 
                           : !selectedChar
                             ? 'bg-gray-50 border-transparent opacity-50 cursor-not-allowed'
                             : 'bg-white border-gray-100 hover:border-indigo-400'
                     }`}
                   >
                     <span className={`text-lg font-black leading-tight ${correctMatches.includes(p.id) ? 'text-green-700' : 'text-gray-800'}`}>
                       {p.event}
                     </span>
                   </button>
                 ))}
               </div>
             </div>
          </section>

          <section className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl"><MessageSquare size={28} /></div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">句子大变身</h3>
                  <p className="text-sm text-gray-400 font-bold">抽一个句子，点击生图获取视觉灵感。</p>
                </div>
              </div>
              <button 
                onClick={nextSentence}
                className="p-4 bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all flex items-center gap-2 group"
              >
                <RefreshCw size={20} className="group-active:rotate-180 transition-transform duration-500" />
                <span className="font-bold text-sm">换一句</span>
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 relative overflow-hidden group">
                <p className="text-xl font-medium text-gray-700 leading-relaxed relative z-10">“{currentSentence}”</p>
              </div>
              
              <button 
                onClick={handleDoubaoImage}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
              >
                <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
                点击让“豆包”生图
              </button>
            </div>
          </section>

          <div className="flex justify-center pt-8">
            <button 
              onClick={() => setSubView('none')}
              className="px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <CheckCircle2 size={24} /> 完成互动挑战，返回学习路径
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SummaryExtensionView = () => (
    <div className="min-h-screen bg-[#fcfaf7] pt-24 pb-32 px-6">
      <SubHeader title="课堂延伸与总结" colorClass="text-indigo-900" />
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none -mr-16 -mt-16">
             <BookOpen size={280} />
          </div>
          
          <div className="flex items-center gap-5 mb-12 relative z-10">
             <div className="p-5 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white rounded-[2rem] shadow-xl shadow-indigo-100">
                <Lightbulb size={36} className="animate-pulse" />
             </div>
             <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">课堂智慧锦囊</h3>
                <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mt-1">核心要点与启示</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
             <div className="bg-orange-50/50 p-8 rounded-[3rem] border border-orange-100/50 group hover:bg-orange-50 transition-all">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                   <Heart size={24} fill="currentColor" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3">情感的纽带</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">牛郎与老牛的“相依为命”，告诉我们勤劳与真诚是世间情感的底色。</p>
             </div>

             <div className="bg-indigo-50/50 p-8 rounded-[3rem] border border-indigo-100/50 group hover:bg-indigo-50 transition-all">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                   <Compass size={24} />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3">勇敢的追寻</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">织女下凡是对幸福的选择，体现了突破重重束缚的巨大勇气。</p>
             </div>

             <div className="bg-blue-50/50 p-8 rounded-[3rem] border border-blue-100/50 group hover:bg-blue-50 transition-all">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                   <Bird size={24} />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-3">想象的力量</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">“鹊桥”是浪漫化身，象征着希望终能跨越困难。</p>
             </div>
          </div>
        </div>

        <div className="bg-[#1a365d] p-12 rounded-[4rem] text-white flex flex-col items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
           
           <div className="relative z-10 text-center w-full">
              <div className="flex items-center justify-center gap-3 mb-6">
                 <div className="p-4 bg-orange-500 rounded-2xl shadow-lg"><Sparkles size={32} /></div>
                 <h4 className="text-4xl font-black tracking-tight">课后家庭延伸任务</h4>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 mb-10 max-w-2xl mx-auto">
                 <p className="text-2xl font-black text-blue-50 leading-relaxed">“尝试用绘画、手工或角色扮演呈现故事，可使用‘豆包’辅助。”</p>
              </div>
           </div>

           <button 
             onClick={() => setSubView('workshop')}
             className="relative z-10 px-12 py-7 bg-white text-[#1a365d] rounded-[2.5rem] font-black shadow-2xl hover:shadow-white/20 active:scale-95 transition-all flex items-center gap-4 text-xl group"
           >
             进入亲子共创工坊 <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        <div className="flex justify-center pt-8">
           <button 
             onClick={() => setSubView('none')}
             className="px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
           >
             <CheckCircle2 size={24} /> 完成延伸，返回学习路径
           </button>
        </div>
      </div>
    </div>
  );

  const WorkshopView = () => {
    const handleAction = async () => {
      const doubaoChatUrl = 'https://www.doubao.com/chat/';
      let prompt = '';
      if (workshopMode === 'drama') prompt = '创作一段牛郎织女亲子表演剧本。';
      else if (workshopMode === 'reading') prompt = '提供牛郎织女故事朗读指导建议。';
      else if (workshopMode === 'craft') prompt = '提供牛郎织女主题手工创意灵感。';
      window.open(`${doubaoChatUrl}?q=${encodeURIComponent(prompt)}`, '_blank');
    };

    return (
      <div className="min-h-screen bg-[#f5f3ff] pt-24 pb-32 px-6">
        <SubHeader title="亲子共创工坊" colorClass="text-purple-600" onBack={() => setSubView('summary_extension')} />
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-3 gap-4">
             {[
               { id: 'reading', n: '声临其境', i: Mic, c: 'text-orange-500', b: 'bg-orange-50' },
               { id: 'drama', n: '剧本演绎', i: Film, c: 'text-purple-500', b: 'bg-purple-50' },
               { id: 'craft', n: '巧手匠心', i: Palette, c: 'text-blue-500', b: 'bg-blue-50' }
             ].map(m => (
               <button 
                 key={m.id}
                 onClick={() => { setWorkshopMode(m.id as WorkshopMode); setWorkshopResult(null); }}
                 className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${workshopMode === m.id ? 'bg-white border-purple-600 shadow-xl scale-105' : 'bg-white/50 border-transparent opacity-60 hover:opacity-100'}`}
               >
                 <div className={`p-4 rounded-2xl ${m.b} ${m.c}`}><m.i size={28} /></div>
                 <span className="block font-black text-gray-900">{m.n}</span>
               </button>
             ))}
          </div>

          <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-purple-100">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
               <div className="flex items-center gap-4">
                 <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                   {workshopMode === 'reading' && <Mic size={32} />}
                   {workshopMode === 'drama' && <Languages size={32} />}
                   {workshopMode === 'craft' && <Brush size={32} />}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-gray-900">灵感助手 · 豆包 AI</h3>
                    <p className="text-sm text-gray-400 font-bold">点击按钮跳转获取 AI 创意灵感</p>
                 </div>
               </div>
               <button 
                 onClick={handleAction} 
                 className="w-full md:w-auto px-10 py-5 bg-purple-600 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
               >
                 <Sparkles size={24} /> 开始生成灵感
               </button>
             </div>
             <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                <button className="w-full border-2 border-dashed border-gray-200 p-12 rounded-[3rem] text-gray-300 font-bold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex flex-col items-center gap-3 group">
                   <div className="p-4 bg-gray-50 rounded-full group-hover:bg-white transition-colors shadow-inner"><ImageIcon size={40} /></div>
                   <span className="text-sm">点击上传亲子共创记录</span>
                </button>
             </div>
          </div>
          <div className="flex justify-center">
             <button 
               onClick={() => setSubView('none')} 
               className="px-10 py-5 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
             >
               <CheckCircle2 size={24} /> 完成创作，返回学习路径
             </button>
          </div>
        </div>
      </div>
    );
  };

  if (subView === 'intro_perception') return <IntroPerceptionView />;
  if (subView === 'reading_study') return <ReadingStudyView />;
  if (subView === 'vocab_study') return <VocabStudyView />;
  if (subView === 'card_interaction') return <CardInteractionView />;
  if (subView === 'summary_extension') return <SummaryExtensionView />;
  if (subView === 'workshop') return <WorkshopView />;

  return (
    <div className="min-h-screen bg-[#fcfaf7] pb-32">
      <div className="bg-[#1a365d] text-white pt-16 pb-24 px-8 rounded-b-[4rem] shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 pr-8 rounded-[2.5rem] border border-white/10 shadow-inner">
             <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"><Users size={24} className="text-white" /></div>
             <div className="flex items-center gap-2">
               <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-indigo-300 mb-1">学生</span><span className="text-xl font-black">{studentName}</span></div>
               <div className="w-px h-8 bg-white/20 mx-3"></div>
               <div className="flex flex-col"><span className="text-[9px] font-black uppercase text-indigo-300 mb-1">家长</span><span className="text-xl font-black">{parentName}</span></div>
             </div>
          </div>
          <button onClick={() => setSubView('report')} className="p-5 bg-orange-500 text-white rounded-[1.5rem] shadow-xl flex items-center gap-2 group">
            <Trophy size={20} className="group-hover:rotate-12 transition-transform" /><span className="font-bold">查看成长勋章</span>
          </button>
        </div>
        <div className="mt-12 flex gap-3 relative z-10 max-w-md">
          {[1, 2].map(id => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex-1 py-4 rounded-3xl transition-all font-bold text-xs tracking-widest border-2 ${activeTab === id ? 'bg-white text-indigo-900 border-white shadow-xl' : 'bg-white/10 text-white/60 border-white/10 hover:bg-white/20'}`}>
              第 {id} 课时：{id === 1 ? '情节感知' : '协同创造'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4"><Sparkles className="text-orange-500" size={24} /><h2 className="text-2xl font-black text-gray-900">今日探索路径</h2></div>
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <button onClick={() => { setSubView('intro_perception'); setIntroStep(0); }} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Monitor size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">1. 故事导入</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">全方位沉浸故事氛围，开启多维感官感知。</p>
              <div className="flex items-center text-indigo-600 font-bold text-sm">开启感官之旅 <ChevronRight size={16} /></div>
            </button>
            <button onClick={() => setSubView('reading_study')} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><BookOpen size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">2. 朗读与讲解</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">阅读《牛郎织女》正文，开启精读模式。</p>
              <div className="flex items-center text-orange-600 font-bold text-sm">进入精读空间 <ChevronRight size={16} /></div>
            </button>
            <button onClick={() => setSubView('vocab_study')} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><BookMarked size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">3. 词语精讲与情节互动</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">拼音、解释和角色情节乱序挑战。</p>
              <div className="flex items-center text-indigo-600 font-bold text-sm">开始学习和挑战 <ChevronRight size={16} /></div>
            </button>
            <button onClick={() => setSubView('summary_extension')} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Sparkles size={32} /></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">4. 课堂延伸与总结</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">总结故事情感，开启亲子共创工坊。</p>
              <div className="flex items-center text-blue-600 font-bold text-sm">开启创意延伸 <ChevronRight size={16} /></div>
            </button>
          </div>
        )}
      </div>

      {subView === 'report' && (
        <div className="fixed inset-0 z-[100] bg-[#1a365d]/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[4rem] p-10 animate-in zoom-in-95 duration-300 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setSubView('none')} className="absolute top-8 right-8 p-3 bg-gray-50 rounded-2xl"><X size={24} className="text-gray-400" /></button>
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-100"><Trophy size={40} /></div>
              <h2 className="text-3xl font-black text-gray-900">{studentName}家庭的成长勋章</h2>
            </div>
            <div className="h-[320px] mb-10"><EvaluationRadar data={stats} /></div>
            <button onClick={() => setSubView('none')} className="w-full mt-10 py-6 bg-indigo-900 text-white rounded-[2rem] font-black shadow-2xl active:scale-95 transition-all">继续探索</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFamily;