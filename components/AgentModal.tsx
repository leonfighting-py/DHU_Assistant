
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, BarChart3, MapPin, Clock, Building2, ExternalLink, Link as LinkIcon, LayoutGrid, ChevronDown, RefreshCw, CalendarDays, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
type CampusType = 'songjiang' | 'yanan';

interface RichData {
  type: 'sports_view' | 'meeting_view' | 'library_view' | 'counseling_view' | 'campus_selector' | 'single_college_link';
  title: string;
  data: any;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  richData?: RichData;
  timestamp: Date;
}

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Constants ---
const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// --- College Database ---
const DHU_COLLEGES = [
  { name: '材料科学与工程学院', url: 'http://esklfpm.dhu.edu.cn/sklfpm/default.jsp', campus: 'songjiang' }, // 1st as requested
  { name: '服装与艺术设计学院', url: 'http://fuzhuang.dhu.edu.cn/', campus: 'yanan' },
  { name: '人文学院', url: 'http://rw.dhu.edu.cn/', campus: 'yanan' },
  { name: '上海国际时尚创意学院', url: 'http://scf.dhu.edu.cn/', campus: 'yanan' },
  { name: '国际文化交流学院', url: 'http://ices.dhu.edu.cn/', campus: 'yanan' },
  { name: '纺织学院', url: 'http://tex.dhu.edu.cn/', campus: 'songjiang' },
  { name: '旭日工商管理学院', url: 'http://gl.dhu.edu.cn/', campus: 'songjiang' },
  { name: '机械工程学院', url: 'http://me.dhu.edu.cn/', campus: 'songjiang' },
  { name: '信息科学与技术学院', url: 'http://ist.dhu.edu.cn/', campus: 'songjiang' },
  { name: '计算机科学与技术学院', url: 'http://jsj.dhu.edu.cn/', campus: 'songjiang' },
  { name: '化学与化工学院', url: 'http://chem.dhu.edu.cn/', campus: 'songjiang' },
  { name: '环境科学与工程学院', url: 'http://env.dhu.edu.cn/', campus: 'songjiang' },
  { name: '理学院', url: 'http://hc.dhu.edu.cn/', campus: 'songjiang' },
  { name: '外语学院', url: 'http://flc.dhu.edu.cn/', campus: 'songjiang' },
  { name: '马克思主义学院', url: 'http://marx.dhu.edu.cn/', campus: 'songjiang' },
  { name: '生物医学工程学院', url: 'http://bme.dhu.edu.cn/', campus: 'songjiang' },
  { name: '人工智能研究院', url: 'http://ai.dhu.edu.cn/', campus: 'songjiang' },
  { name: '先进低维材料中心', url: 'http://calm.dhu.edu.cn/', campus: 'songjiang' },
  { name: '民用航空复合材料中心', url: 'http://ccac.dhu.edu.cn/', campus: 'songjiang' },
  { name: '体育部', url: 'http://tyb.dhu.edu.cn/', campus: 'songjiang' },
];

// --- Helpers ---
const getNext7Days = () => {
    const today = new Date();
    const day = today.getDay() || 7; 
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
            name: WEEK_DAYS[i],
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            fullDate: d
        });
    }
    return days;
};

// --- Generators ---
const generateSportsData = (sport: string, campus: CampusType, dateIndex: number) => {
    // Zones requested: Main, Aux, Indoor, Outdoor
    const zones = campus === 'songjiang' 
        ? ['主体育馆', '副馆', '室内专项馆', '室外场地'] 
        : ['延安路体育馆', '室外苑区'];

    const items: any[] = [];
    const timeSlots = [];
    for (let h = 8; h < 21; h++) {
        timeSlots.push(`${h.toString().padStart(2,'0')}:00-${(h+1).toString().padStart(2,'0')}:00`);
    }

    zones.forEach(zone => {
        const count = zone.includes('主') ? 12 : 6;
        for (let i = 1; i <= count; i++) {
            timeSlots.forEach(time => {
                const hour = parseInt(time.split(':')[0]);
                // Seed logic: Change availability based on dateIndex
                const seed = zone.length + i + hour + dateIndex * 7;
                let busyProb = 0.4;
                if (hour >= 18) busyProb = 0.8;
                if (dateIndex === 5 || dateIndex === 6) busyProb += 0.2; // Weekend busier

                const isBusy = (seed % 100) / 100 < busyProb;
                items.push({
                    id: `${sport}-${zone}-${i}-${time}-${dateIndex}`,
                    name: `${zone} ${i}号场`,
                    zone,
                    time,
                    hour,
                    status: isBusy ? 'busy' : 'available',
                    price: sport === '台球' ? 10 : 0
                });
            });
        }
    });

    return { zones, timeSlots, items };
};

const generateMeetingData = (campus: CampusType, dateIndex: number) => {
    let zones: {name: string, count: number}[] = [];
    if (campus === 'songjiang') {
        zones = [
            { name: '图文信息中心', count: 11 },
            { name: '图书馆', count: 8 },
            { name: '大学生活动中心', count: 5 },
            { name: '复材楼', count: 4 },
            { name: '32号楼', count: 3 },
            { name: '锦绣会堂', count: 1 },
        ];
    } else {
        zones = [
            { name: '中心大楼', count: 6 },
            { name: '第三教学楼', count: 5 },
            { name: '大学生活动中心', count: 4 },
        ];
    }

    const items: any[] = [];
    const timeSlots = [];
    for (let h = 8; h < 21; h++) {
        timeSlots.push(`${h.toString().padStart(2,'0')}:00-${(h+1).toString().padStart(2,'0')}:00`);
    }

    zones.forEach(z => {
        for (let i = 1; i <= z.count; i++) {
            timeSlots.forEach(time => {
                const hour = parseInt(time.split(':')[0]);
                const seed = z.name.length + i + hour + dateIndex * 13;
                let busyProb = 0.3;
                if (hour >= 13 && hour <= 16) busyProb = 0.6;
                const isBusy = (seed % 100) / 100 < busyProb;
                items.push({
                    id: `mtg-${z.name}-${i}-${time}-${dateIndex}`,
                    name: `${z.name} ${i.toString().padStart(2,'0')}室`,
                    zone: z.name,
                    time,
                    hour,
                    status: isBusy ? 'busy' : 'available',
                    price: 0
                });
            });
        }
    });

    return { zones: zones.map(z => z.name), timeSlots, items };
};

const generateLibraryData = (campus: CampusType, dateIndex: number) => {
    const isSongjiang = campus === 'songjiang';
    const baseAreas = isSongjiang 
        ? [
            { area: '一楼自修室', total: 120 },
            { area: '三楼阅览室', total: 80 },
            { area: '四楼研讨间', total: 10 },
            { area: '五楼视听区', total: 50 }
        ]
        : [
            { area: '一楼阅览室', total: 60 },
            { area: '二楼自修区', total: 40 },
            { area: '三楼研讨室', total: 30 }
        ];

    return baseAreas.map(area => {
        // Randomize available seats based on date
        const seed = area.area.length + dateIndex;
        const usageRate = ((seed * 17) % 100) / 100; // 0 to 0.99
        const available = Math.floor(area.total * (1 - usageRate));
        let status = 'plenty';
        if (available === 0) status = 'full';
        else if (available < area.total * 0.2) status = 'few';
        
        return { ...area, available, status };
    });
};

const generateCounselingData = (campus: CampusType, dateIndex: number) => {
    // Doctors schedule based on day of week (dateIndex 0=Mon, 6=Sun)
    const doctors = [];
    const isSongjiang = campus === 'songjiang';
    
    // Schedule Logic
    if (isSongjiang) {
        if (dateIndex === 2) doctors.push({ name: '王老师', specialty: '学业压力', time: '14:00-17:00' }); // Wed
        if (dateIndex === 3) doctors.push({ name: '李老师', specialty: '人际关系', time: '09:00-11:30' }); // Thu
        if (dateIndex === 0 || dateIndex === 4) doctors.push({ name: '值班医生', specialty: '综合咨询', time: '13:00-16:00' }); // Mon/Fri
    } else {
        if (dateIndex === 1) doctors.push({ name: '张老师', specialty: '情绪管理', time: '13:00-16:00' }); // Tue
        if (dateIndex === 4) doctors.push({ name: '赵老师', specialty: '职业规划', time: '10:00-12:00' }); // Fri
    }

    return {
        location: isSongjiang ? '松江大学生活动中心205' : '延安路校区心理咨询室',
        doctors
    };
};

// --- Shared Components ---

const ServiceHeader: React.FC<{
    title: string;
    icon: React.ComponentType<any>;
    campus: CampusType;
    onSwitchCampus: (c: CampusType) => void;
}> = ({ title, icon: Icon, campus, onSwitchCampus }) => (
    <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-dhu-red/10 p-1.5 rounded-full text-dhu-red">
                <Icon size={16} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        </div>
        <button 
            onClick={() => onSwitchCampus(campus === 'songjiang' ? 'yanan' : 'songjiang')}
            className="text-[10px] flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-full text-gray-800 hover:text-dhu-red hover:border-dhu-red transition-all shadow-sm font-medium"
        >
            <RefreshCw size={10} />
            切换至{campus === 'songjiang' ? '延安路' : '松江'}
        </button>
    </div>
);

const DateSelector: React.FC<{
    selectedIdx: number;
    onSelect: (idx: number) => void;
}> = ({ selectedIdx, onSelect }) => {
    const days = getNext7Days();
    return (
        <div className="border-b border-gray-100 bg-gray-50/50 p-2">
            <div className="flex justify-between gap-1 overflow-x-auto no-scrollbar">
                {days.map((d, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(idx)}
                        className={`flex-1 min-w-[45px] flex flex-col items-center justify-center py-1.5 rounded-md text-[10px] transition-all ${
                            selectedIdx === idx 
                            ? 'bg-dhu-red text-white shadow-md' 
                            : 'bg-white text-gray-700 border border-gray-100 hover:bg-gray-100'
                        }`}
                    >
                        <span className="font-bold mb-0.5">{d.name}</span>
                        <span className="opacity-90 scale-90">{d.date}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- View Components ---

// 1. Dashboard (Heatmap) - Used for Sports & Meeting
const HeatmapDashboard: React.FC<{
    dataGenerator: (campus: CampusType, dateIndex: number) => any;
    initialCampus: CampusType;
    title: string;
    icon: React.ComponentType<any>;
    itemLabel: string;
    onBook: (item: any) => void;
    showPrice?: boolean;
}> = ({ dataGenerator, initialCampus, title, icon, itemLabel, onBook, showPrice }) => {
    const [campus, setCampus] = useState<CampusType>(initialCampus);
    const [dateIdx, setDateIdx] = useState(0);
    const [selectedZone, setSelectedZone] = useState('all');
    const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
    const [bookedIds, setBookedIds] = useState<Record<string, boolean>>({});

    const data = dataGenerator(campus, dateIdx);
    
    // Filter logic
    const filteredItems = data.items.filter((item: any) => {
        if (selectedZone !== 'all' && item.zone !== selectedZone) return false;
        return true;
    });

    // Aggregation
    const heatmapData: Record<string, { total: number; available: number; items: any[] }> = {};
    data.timeSlots.forEach((slot: string) => {
        heatmapData[slot] = { total: 0, available: 0, items: [] };
    });
    filteredItems.forEach((item: any) => {
        if (heatmapData[item.time]) {
            heatmapData[item.time].total++;
            if (item.status === 'available') heatmapData[item.time].available++;
            heatmapData[item.time].items.push(item);
        }
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
            <ServiceHeader title={title} icon={icon} campus={campus} onSwitchCampus={setCampus} />
            <DateSelector selectedIdx={dateIdx} onSelect={(i) => { setDateIdx(i); setExpandedSlot(null); }} />
            
            {/* Heatmap Grid */}
            <div className="p-4 grid grid-cols-4 gap-2">
                {data.timeSlots.map((slot: string) => {
                    const stats = heatmapData[slot];
                    const ratio = stats.total > 0 ? stats.available / stats.total : 0;
                    
                    let colorClass = 'bg-gray-100 text-gray-400';
                    let label = '已满';
                    if (ratio > 0.6) { colorClass = 'bg-green-50 border-green-200 text-green-700'; label = '充裕'; }
                    else if (ratio > 0) { colorClass = 'bg-orange-50 border-orange-200 text-orange-600'; label = '紧张'; }

                    const isSelected = expandedSlot === slot;
                    return (
                        <button
                            key={slot}
                            onClick={() => setExpandedSlot(isSelected ? null : slot)}
                            className={`border rounded-lg p-2 flex flex-col items-center transition-all ${isSelected ? 'ring-2 ring-dhu-red' : ''} ${colorClass} ${ratio === 0 ? 'opacity-70' : ''}`}
                        >
                            <span className="text-[10px] font-bold text-gray-800 mb-1">{slot.split('-')[0]}</span>
                            <span className="text-[10px] font-extrabold">{label}</span>
                            <div className="mt-1 w-full bg-black/5 h-1 rounded-full overflow-hidden">
                                <div className={`h-full ${ratio === 0 ? 'bg-gray-300' : ratio > 0.6 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${ratio * 100}%` }}></div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Drill Down */}
            {expandedSlot && (
                <div className="border-t border-gray-100 bg-gray-50 p-3 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                             {/* Zone Selector placed here as requested, explicitly text-gray-900 */}
                             <select 
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                className="text-xs text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-dhu-red bg-white"
                             >
                                <option value="all">全部区域</option>
                                {data.zones.map((z: string) => <option key={z} value={z}>{z}</option>)}
                             </select>
                             <span className="text-xs font-bold text-gray-700">可预约{itemLabel}</span>
                        </div>
                        <button onClick={() => setExpandedSlot(null)}><X size={14} className="text-gray-600" /></button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                         {heatmapData[expandedSlot].items
                            .sort((a,b) => a.status === 'available' ? -1 : 1)
                            .map((item: any) => (
                             <div key={item.id} className="bg-white p-2 rounded border border-gray-100 flex justify-between items-center shadow-sm">
                                 <div>
                                     <div className="text-xs font-bold text-gray-900">{item.name}</div>
                                     {showPrice && (
                                         <div className="text-[10px] font-medium mt-0.5">
                                             {item.price === 0 ? <span className="text-green-600 font-bold">免费</span> : <span className="text-gray-900">¥{item.price}</span>}
                                         </div>
                                     )}
                                 </div>
                                 {item.status === 'available' ? (
                                     <button
                                        disabled={bookedIds[item.id]}
                                        onClick={() => {
                                            setBookedIds(p => ({...p, [item.id]: true}));
                                            onBook(item);
                                        }}
                                        className={`text-[10px] px-3 py-1.5 rounded font-bold transition-colors ${bookedIds[item.id] ? 'bg-green-100 text-green-700' : 'bg-dhu-red text-white hover:bg-[#85021a]'}`}
                                     >
                                         {bookedIds[item.id] ? '已成功' : '预约'}
                                     </button>
                                 ) : (
                                     <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">占用</span>
                                 )}
                             </div>
                         ))}
                         {heatmapData[expandedSlot].items.length === 0 && <div className="text-center text-xs text-gray-500 py-2">无数据</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Library View
const LibraryView: React.FC<{ initialCampus: CampusType, onBook: (item:any) => void }> = ({ initialCampus, onBook }) => {
    const [campus, setCampus] = useState(initialCampus);
    const [dateIdx, setDateIdx] = useState(0);
    const data = generateLibraryData(campus, dateIdx);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
            <ServiceHeader title="图书馆座位预约" icon={Building2} campus={campus} onSwitchCampus={setCampus} />
            <DateSelector selectedIdx={dateIdx} onSelect={setDateIdx} />
            <div className="p-3 space-y-2">
                {data.map((area: any, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <div className="font-bold text-sm text-gray-900">{area.area}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${area.status === 'plenty' ? 'bg-green-500' : area.status === 'few' ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                                <span className="text-xs text-gray-600">{area.status === 'plenty' ? '座位充足' : area.status === 'few' ? '座位紧张' : '已满'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-sm"><span className="text-dhu-red font-bold">{area.available}</span><span className="text-gray-500">/{area.total}</span></div>
                             {area.available > 0 && (
                                 <button onClick={() => onBook({ name: area.area, time: '全天' })} className="mt-1 text-[10px] bg-white border border-dhu-red text-dhu-red px-2 py-0.5 rounded hover:bg-red-50 font-medium">预约</button>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Counseling View
const CounselingView: React.FC<{ initialCampus: CampusType, onBook: (item:any) => void }> = ({ initialCampus, onBook }) => {
    const [campus, setCampus] = useState(initialCampus);
    const [dateIdx, setDateIdx] = useState(0);
    const { location, doctors } = generateCounselingData(campus, dateIdx);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
            <ServiceHeader title="心理咨询预约" icon={User} campus={campus} onSwitchCampus={setCampus} />
            <DateSelector selectedIdx={dateIdx} onSelect={setDateIdx} />
            <div className="p-3">
                <div className="flex items-center gap-1 text-xs text-gray-700 mb-3 bg-blue-50 p-2 rounded border border-blue-100">
                    <MapPin size={12} className="text-blue-600"/> <span className="font-medium text-blue-800">地点：</span>{location}
                </div>
                {doctors.length > 0 ? (
                    doctors.map((doc, i) => (
                        <div key={i} className="mb-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm text-gray-900">{doc.name}</div>
                                <div className="text-xs text-gray-600 mt-0.5">擅长: {doc.specialty}</div>
                                <div className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Clock size={10}/> {doc.time}</div>
                            </div>
                            <button onClick={() => onBook({ name: doc.name, time: doc.time })} className="bg-dhu-red text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#85021a]">预约</button>
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        今日无排班医生，请尝试切换日期
                    </div>
                )}
            </div>
        </div>
    );
};

// 4. College List Component
const CollegeList: React.FC<{ initialCampus: CampusType }> = ({ initialCampus }) => {
    const [campus, setCampus] = useState(initialCampus);
    const [showAll, setShowAll] = useState(false);
    
    const filtered = DHU_COLLEGES.filter(c => !campus || c.campus === campus);
    const display = showAll ? filtered : filtered.slice(0, 3);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
            <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                 <span className="text-xs font-bold text-gray-800 uppercase flex items-center gap-2">
                    <LayoutGrid size={14} /> 学院内部会议室
                 </span>
                 <div className="flex gap-2">
                     <button onClick={() => setCampus(campus === 'songjiang' ? 'yanan' : 'songjiang')} className="text-[10px] text-gray-600 hover:text-dhu-red underline font-medium">
                         只看{campus === 'songjiang' ? '延安路' : '松江'}
                     </button>
                 </div>
            </div>
            <div className="divide-y divide-gray-100">
                {display.map((c, i) => (
                    <div key={i} onClick={() => window.open(c.url, '_blank')} className="p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer group">
                        <span className="text-sm font-medium text-gray-900">{c.name}</span>
                        <ExternalLink size={14} className="text-gray-400 group-hover:text-dhu-red" />
                    </div>
                ))}
            </div>
            <button onClick={() => setShowAll(!showAll)} className="w-full py-2 text-center text-xs text-dhu-red font-medium hover:bg-red-50 transition-colors">
                {showAll ? '收起' : '查找更多学院'}
            </button>
        </div>
    );
};

// --- Main Modal ---
const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
      { id: 'init', sender: 'bot', text: '你好！我是你的校园活动助手。\n您可以查询体育、会议室、图书馆或心理咨询预约。', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processAI = async (text: string, isSystemEvent: boolean = false) => {
      setIsTyping(true);
      try {
          // Fallback logic if API key missing
          if (!process.env.API_KEY) {
              const q = text.toLowerCase();
              let rich: RichData | undefined;
              let responseText = "我明白您的意思，请查看：";
              
              if (q.includes('心理')) {
                   rich = { type: 'counseling_view', title: '心理咨询', data: { campus: 'songjiang' } };
              } else if (q.includes('图书馆')) {
                   rich = { type: 'library_view', title: '图书馆', data: { campus: 'songjiang' } };
              } else if (q.includes('会议')) {
                   rich = { type: 'meeting_view', title: '会议室', data: { campus: 'songjiang' } };
              } else if (q.includes('体育') || q.includes('球') || q.includes('运动')) {
                   const sport = q.includes('台球') ? '台球' : '羽毛球';
                   rich = { type: 'sports_view', title: sport, data: { sport, campus: 'songjiang' } };
              } else if (isSystemEvent) {
                   responseText = q.includes('sports') ? "预约成功！请按时前往场馆。" : "您的预约申请已提交，请等待管理员审核。";
              } else {
                   const college = DHU_COLLEGES.find(c => q.includes(c.name) || (c.name.length > 3 && q.includes(c.name.replace('学院',''))));
                   if (college) {
                       rich = { type: 'single_college_link', title: college.name, data: college };
                       responseText = `为您找到${college.name}的入口：`;
                   } else {
                       responseText = "抱歉，我只能帮您查询体育、会议、图书馆或心理咨询相关内容。";
                   }
              }

              setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: responseText, richData: rich, timestamp: new Date() }]);
              return;
          }

          // Gemini Logic
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

          const tools = [{ functionDeclarations: [
              { name: "search_sports", description: "Search sports venues", parameters: { type: Type.OBJECT, properties: { sport: { type: Type.STRING }, campus: { type: Type.STRING } } } },
              { name: "search_meeting", description: "Search meeting rooms", parameters: { type: Type.OBJECT, properties: { campus: { type: Type.STRING } } } },
              { name: "search_library", description: "Search library seats", parameters: { type: Type.OBJECT, properties: { campus: { type: Type.STRING } } } },
              { name: "search_counseling", description: "Search counseling", parameters: { type: Type.OBJECT, properties: { campus: { type: Type.STRING } } } },
              { name: "find_college", description: "Find specific college url", parameters: { type: Type.OBJECT, properties: { name: { type: Type.STRING } }, required: ['name'] } },
          ]}];

          const result = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              config: {
                systemInstruction: `You are a helper for Donghua University. 
                If the user input starts with [SYSTEM_EVENT], it means a user action occurred (like clicking 'Book'). Respond with a confirmation (e.g., "Booking confirmed").
                Otherwise, classify intent into tools.
                Strictly prioritize: 1. Counseling 2. Library 3. Sports 4. Meeting. 
                Only match "College" if the user explicitly names a college.
                Respond in Chinese.`,
                tools
              },
              contents: [{ role: 'user', parts: [{ text }] }]
          });

          const fc = result.functionCalls?.[0];
          
          if (fc) {
              const args = fc.args as any;
              const campus = args.campus === 'yanan' ? 'yanan' : 'songjiang';
              let rich: RichData | undefined;

              switch (fc.name) {
                  case 'search_counseling': rich = { type: 'counseling_view', title: '心理咨询', data: { campus } }; break;
                  case 'search_library': rich = { type: 'library_view', title: '图书馆', data: { campus } }; break;
                  case 'search_meeting': rich = { type: 'meeting_view', title: '会议室', data: { campus } }; break;
                  case 'search_sports': rich = { type: 'sports_view', title: args.sport || '羽毛球', data: { sport: args.sport || '羽毛球', campus } }; break;
                  case 'find_college': 
                       const c = DHU_COLLEGES.find(col => col.name.includes(args.name));
                       if (c) rich = { type: 'single_college_link', title: c.name, data: c };
                       break;
              }
              setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: `为您查询到相关信息：`, richData: rich, timestamp: new Date() }]);
          } else {
              setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: result.text || '暂无回复', timestamp: new Date() }]);
          }

      } catch (e) {
          console.error(e);
          setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: "系统繁忙，请稍后再试。", timestamp: new Date() }]);
      } finally {
          setIsTyping(false);
      }
  };

  const handleUserSend = () => {
      if(!input.trim()) return;
      setMessages(p => [...p, { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() }]);
      processAI(input);
      setInput('');
  };

  const handleBookingTrigger = (item: any, type: string) => {
      const prompt = `[SYSTEM_EVENT] User booked ${type}: ${item.name} at ${item.time}.`;
      processAI(prompt, true);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? '' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-2xl bg-[#f3f4f6] rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-100 p-1.5 rounded-full text-orange-600"><Bot size={20}/></div>
                    <span className="font-bold text-gray-800">校园活动助手</span>
                </div>
                <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] ${m.sender === 'user' ? 'bg-dhu-red text-white p-3 rounded-2xl rounded-tr-none' : ''}`}>
                             {m.text && !m.text.startsWith('[SYSTEM_EVENT]') && (
                                 <div className={`whitespace-pre-wrap ${m.sender === 'bot' ? 'bg-white p-3 rounded-2xl rounded-tl-none text-gray-800 border border-gray-100 shadow-sm' : ''}`}>
                                     {m.text}
                                 </div>
                             )}
                             {m.richData && (
                                 <div className="mt-2 w-full max-w-md">
                                     {m.richData.type === 'sports_view' && (
                                         <HeatmapDashboard 
                                            title={m.richData.title} 
                                            icon={BarChart3} 
                                            itemLabel="场地" 
                                            initialCampus={m.richData.data.campus}
                                            dataGenerator={(c, d) => generateSportsData(m.richData!.data.sport, c, d)}
                                            onBook={(item) => handleBookingTrigger(item, 'sports')}
                                            showPrice={true}
                                         />
                                     )}
                                     {m.richData.type === 'meeting_view' && (
                                         <>
                                            <HeatmapDashboard 
                                                title="会议室预约" 
                                                icon={Building2} 
                                                itemLabel="会议室" 
                                                initialCampus={m.richData.data.campus}
                                                dataGenerator={(c, d) => generateMeetingData(c, d)}
                                                onBook={(item) => handleBookingTrigger(item, 'meeting')}
                                            />
                                            <CollegeList initialCampus={m.richData.data.campus} />
                                         </>
                                     )}
                                     {m.richData.type === 'library_view' && (
                                         <LibraryView initialCampus={m.richData.data.campus} onBook={(item) => handleBookingTrigger(item, 'library')} />
                                     )}
                                     {m.richData.type === 'counseling_view' && (
                                         <CounselingView initialCampus={m.richData.data.campus} onBook={(item) => handleBookingTrigger(item, 'counseling')} />
                                     )}
                                     {m.richData.type === 'single_college_link' && (
                                         <div onClick={() => window.open(m.richData!.data.url, '_blank')} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center cursor-pointer hover:border-dhu-red">
                                             <div>
                                                 <div className="font-bold text-gray-900">{m.richData.title}</div>
                                                 <div className="text-xs text-gray-400">点击跳转</div>
                                             </div>
                                             <ExternalLink size={16} className="text-gray-300"/>
                                         </div>
                                     )}
                                 </div>
                             )}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-xs text-gray-400 animate-pulse ml-2">正在思考...</div>}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t">
                <div className="relative">
                    <input 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-dhu-red placeholder-gray-500"
                        placeholder="输入：羽毛球、会议室、图书馆..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUserSend()}
                    />
                    <button onClick={handleUserSend} className="absolute right-1 top-1 p-1 bg-dhu-red text-white rounded-full"><Send size={16}/></button>
                </div>
                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                    {['体育预约', '会议室', '图书馆', '心理咨询'].map(t => (
                        <button key={t} onClick={() => { setInput(t); processAI(t); }} className="whitespace-nowrap px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 hover:text-dhu-red hover:border-dhu-red">
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default AgentModal;
