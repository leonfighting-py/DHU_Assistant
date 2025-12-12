import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Send, Bot, User, BarChart3, MapPin, Clock, Building2, ExternalLink, LayoutGrid, RefreshCw, School, Utensils, AlertCircle, HeartHandshake, Key, Settings, Loader2, TrendingDown, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

// --- Configuration ---
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL_NAME = 'deepseek-ai/DeepSeek-V3';

// --- Types ---
type CampusType = 'songjiang' | 'yanan';

interface RichData {
  type: 'sports_view' | 'meeting_view' | 'library_view' | 'classroom_view' | 'counseling_view' | 'campus_selector' | 'single_college_link' | 'canteen_view';
  title: string;
  data: any;
  recommendationCriteria?: {
      requirements?: string[];
      minCapacity?: number;
      sportType?: string;
  };
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
  initialIntent?: string | null;
}

// --- Constants ---
const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const SUGGESTIONS = ['帮我找一个安静的自习教室', '预约一个6人的有投影的会议室', '想去室内打羽毛球', '食堂人流量查询', '心理咨询预约'];

const CANTEEN_FLOORS = [
  '一食堂一楼',
  '一食堂二楼',
  '二食堂一楼',
  '二食堂二楼',
  '二食堂三楼'
];

// --- College Database ---
const DHU_COLLEGES = [
  { name: '材料科学与工程学院', aliases: ['材料', '材院'], url: 'http://esklfpm.dhu.edu.cn/sklfpm/default.jsp', campus: 'songjiang' },
  { name: '服装与艺术设计学院', aliases: ['服装', '服院', '艺术'], url: 'http://fuzhuang.dhu.edu.cn/', campus: 'yanan' },
  { name: '旭日工商管理学院', aliases: ['管院', '工商', '旭日', '管理'], url: 'http://gl.dhu.edu.cn/', campus: 'yanan' },
  { name: '人文学院', aliases: ['人文'], url: 'http://rw.dhu.edu.cn/', campus: 'yanan' },
  { name: '上海国际时尚创意学院', aliases: ['时尚', '创意', 'SCF'], url: 'http://scf.dhu.edu.cn/', campus: 'yanan' },
  { name: '国际文化交流学院', aliases: ['国交', '国际文化'], url: 'http://ices.dhu.edu.cn/', campus: 'yanan' },
  { name: '纺织学院', aliases: ['纺织'], url: 'http://tex.dhu.edu.cn/', campus: 'songjiang' },
  { name: '机械工程学院', aliases: ['机械'], url: 'http://me.dhu.edu.cn/', campus: 'songjiang' },
  { name: '信息科学与技术学院', aliases: ['信息', '信科', '信院'], url: 'http://ist.dhu.edu.cn/', campus: 'songjiang' },
  { name: '计算机科学与技术学院', aliases: ['计算机', '计院'], url: 'http://jsj.dhu.edu.cn/', campus: 'songjiang' },
  { name: '化学与化工学院', aliases: ['化工', '化学'], url: 'http://chem.dhu.edu.cn/', campus: 'songjiang' },
  { name: '环境科学与工程学院', aliases: ['环境', '环院'], url: 'http://env.dhu.edu.cn/', campus: 'songjiang' },
  { name: '理学院', aliases: ['理学院'], url: 'http://hc.dhu.edu.cn/', campus: 'songjiang' },
  { name: '外语学院', aliases: ['外语'], url: 'http://flc.dhu.edu.cn/', campus: 'songjiang' },
  { name: '马克思主义学院', aliases: ['马院', '马克思'], url: 'http://marx.dhu.edu.cn/', campus: 'songjiang' },
  { name: '生物医学工程学院', aliases: ['生医', '生物'], url: 'http://bme.dhu.edu.cn/', campus: 'songjiang' },
  { name: '人工智能研究院', aliases: ['人工智能', 'AI'], url: 'http://ai.dhu.edu.cn/', campus: 'songjiang' },
  { name: '先进低维材料中心', aliases: ['低维'], url: 'http://calm.dhu.edu.cn/', campus: 'songjiang' },
  { name: '民用航空复合材料中心', aliases: ['民航', '复材'], url: 'http://ccac.dhu.edu.cn/', campus: 'songjiang' },
  { name: '体育部', aliases: ['体育'], url: 'http://tyb.dhu.edu.cn/', campus: 'songjiang' },
];

// --- Helpers ---
const getNext7Days = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const day = today.getDay() || 7; 
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        d.setHours(0, 0, 0, 0);

        days.push({
            name: WEEK_DAYS[i],
            date: `${d.getMonth() + 1}/${d.getDate()}`,
            fullDate: d,
            isPast: d < today,
            isToday: d.getTime() === today.getTime()
        });
    }
    return days;
};

const findCollegeByInput = (input: string) => {
    if (!input) return undefined;
    const lowerInput = input.toLowerCase();
    return DHU_COLLEGES.find(c => {
        if (lowerInput.includes(c.name.toLowerCase())) return true;
        if (c.aliases && c.aliases.some(alias => lowerInput.includes(alias.toLowerCase()))) return true;
        const shortName = c.name.replace('学院', '');
        if (shortName.length >= 2 && lowerInput.includes(shortName)) return true;
        return false;
    });
};

// --- Recommendation Engine ---
const calculateScore = (item: any, criteria: any) => {
    let score = 0;
    const requirements = criteria?.requirements || [];
    
    // Feature matching
    if (requirements.length > 0 && item.tags) {
        requirements.forEach((req: string) => {
            if (item.tags.some((tag: string) => tag.includes(req) || req.includes(tag))) {
                score += 5;
            }
        });
        // Check fuzzy match in name
        requirements.forEach((req: string) => {
            if (item.name.includes(req)) score += 2;
        });
    }

    // Capacity matching
    if (criteria?.minCapacity && item.capacity) {
        if (item.capacity >= criteria.minCapacity) {
            score += 10; // Base score for meeting requirement
            // Penalize huge excess capacity to be efficient (optional)
            if (item.capacity > criteria.minCapacity * 3) score -= 2;
        } else {
            score = -100; // Filter out
        }
    }

    // Availability Bonus
    if (item.status === 'available') score += 20;

    return score;
};

// --- Generators with Enhanced Database ---

const generateSportsData = (sport: string, campus: CampusType, dateIndex: number) => {
    const isSongjiang = campus === 'songjiang';
    
    // Define zones with attributes
    const zonesConfig = isSongjiang ? [
        { name: '主体育馆', tags: ['室内', '专业', '比赛'], indoor: true },
        { name: '副馆', tags: ['室内', '训练'], indoor: true },
        { name: '室内专项馆', tags: ['室内', '瑜伽', '舞蹈'], indoor: true },
        { name: '室外场地', tags: ['室外', '通风', '夜场灯光'], indoor: false }
    ] : [
        { name: '延安路体育馆', tags: ['室内', '综合'], indoor: true },
        { name: '室外苑区', tags: ['室外', '网球', '篮球'], indoor: false }
    ];

    const items: any[] = [];
    const timeSlots = [];
    for (let h = 8; h < 21; h++) {
        timeSlots.push(`${h.toString().padStart(2,'0')}:00-${(h+1).toString().padStart(2,'0')}:00`);
    }

    zonesConfig.forEach(z => {
        const count = z.name.includes('主') ? 8 : 4;
        for (let i = 1; i <= count; i++) {
            // Inherit tags from zone
            const itemTags = [...z.tags, sport];

            timeSlots.forEach(time => {
                const hour = parseInt(time.split(':')[0]);
                const seed = z.name.length + i + hour + dateIndex * 7;
                let busyProb = 0.4;
                if (hour >= 18) busyProb = 0.8;
                
                const isBusy = (seed % 100) / 100 < busyProb;
                items.push({
                    id: `${sport}-${z.name}-${i}-${time}-${dateIndex}`,
                    name: `${z.name} ${i}号场`,
                    zone: z.name,
                    tags: itemTags,
                    time,
                    hour,
                    status: isBusy ? 'busy' : 'available',
                    price: sport === '台球' ? 10 : 0,
                    requiresApproval: false,
                    capacity: sport === '篮球' ? 10 : 4 
                });
            });
        }
    });

    return { zones: zonesConfig.map(z => z.name), timeSlots, items };
};

const generateMeetingData = (campus: CampusType, dateIndex: number) => {
    let zones: {name: string, count: number, capacity: number, tags: string[]}[] = [];
    
    // Enhanced Database with specific descriptions
    if (campus === 'songjiang') {
        zones = [
            { name: '图文信息中心', count: 6, capacity: 20, tags: ['投屏', '音响', '空调', '正式', '视频会议'] },
            { name: '图书馆研讨室', count: 8, capacity: 6, tags: ['白板', '静音', '空调', '讨论', '离图书馆近'] },
            { name: '大学生活动中心', count: 5, capacity: 50, tags: ['舞台', '音响', '投屏', '大型', '学生活动'] },
            { name: '复材楼会议室', count: 4, capacity: 10, tags: ['投屏', '白板', '科研', '安静'] },
            { name: '32号楼活动室', count: 3, capacity: 8, tags: ['白板', '社团', '灵活'] },
            { name: '锦绣会堂', count: 1, capacity: 200, tags: ['大型舞台', '专业音响', '报告厅', '庆典'] },
        ];
    } else {
        zones = [
            { name: '中心大楼会议室', count: 6, capacity: 15, tags: ['投屏', '空调', '行政', '正式'] },
            { name: '第三教学楼教室', count: 5, capacity: 40, tags: ['黑板', '投影', '教学', '讲座'] },
            { name: '大学生活动中心', count: 4, capacity: 30, tags: ['音响', '镜子', '排练', '活动'] },
        ];
    }

    const items: any[] = [];
    const timeSlots = [];
    for (let h = 8; h < 21; h++) {
        timeSlots.push(`${h.toString().padStart(2,'0')}:00-${(h+1).toString().padStart(2,'0')}:00`);
    }

    zones.forEach(z => {
        const requiresApproval = ['锦绣会堂', '图文信息中心', '复材楼'].some(key => z.name.includes(key));

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
                    tags: z.tags, 
                    time,
                    hour,
                    status: isBusy ? 'busy' : 'available',
                    capacity: z.capacity,
                    features: z.tags, // Legacy compat
                    price: 0,
                    requiresApproval
                });
            });
        }
    });

    return { zones: zones.map(z => z.name), timeSlots, items };
};

const generateClassroomData = (campus: CampusType, dateIndex: number) => {
    const zonesConfig = campus === 'songjiang' 
        ? [
            { name: '第一教学楼', tags: ['离食堂近', '容量大', '人流量大', '多媒体', '热闹'] },
            { name: '第二教学楼', tags: ['安静', '适合自习', '离图书馆近', '空调足', '插座多'] }
          ]
        : [
            { name: '第三教学楼', tags: ['离食堂近', '上课频繁', '设备新', '中心区域'] },
            { name: '第四教学楼', tags: ['安静', '小教室', '冷气足', '老建筑', '氛围好'] }
          ];

    const items: any[] = [];
    const timeSlots = [];
    for (let h = 8; h < 21; h++) {
        timeSlots.push(`${h.toString().padStart(2,'0')}:00-${(h+1).toString().padStart(2,'0')}:00`);
    }

    zonesConfig.forEach(zone => {
        const floors = 4;
        const roomsPerFloorSample = 3; 

        for (let f = 1; f <= floors; f++) {
            for (let r = 1; r <= roomsPerFloorSample; r++) {
                 // Deterministic room generation
                 const roomNum = ((r * 11 + dateIndex) % 50) + 1; 
                 let buildingPrefix = '';
                 if (zone.name.includes('一')) buildingPrefix = '1';
                 else if (zone.name.includes('二')) buildingPrefix = '2';
                 else if (zone.name.includes('三')) buildingPrefix = '3';
                 else buildingPrefix = '4';

                 const roomCode = `${buildingPrefix}${f}${roomNum.toString().padStart(2, '0')}`;
                 
                 // Mix zone tags with some random room-specific tags
                 const roomTags = [...zone.tags];
                 if (roomNum % 2 === 0) roomTags.push('靠窗');
                 if (f === 1) roomTags.push('低楼层');
                 
                 timeSlots.forEach(time => {
                    const hour = parseInt(time.split(':')[0]);
                    const seed = parseInt(roomCode) + hour + dateIndex;
                    let busyProb = 0.15;
                    if ((hour >= 8 && hour <= 11) || (hour >= 13 && hour <= 16)) busyProb = 0.75;
                    if (dateIndex >= 5) busyProb = 0.1;
                    
                    // Special rule: Quiet buildings are busier in evening for self-study
                    if (zone.tags.includes('安静') && hour > 18) busyProb += 0.2;

                    const isBusy = (seed % 100) / 100 < busyProb;
                    
                    items.push({
                        id: `cls-${roomCode}-${time}-${dateIndex}`,
                        name: `${zone.name} ${roomCode}`,
                        zone: zone.name,
                        tags: roomTags,
                        time,
                        hour,
                        status: isBusy ? 'busy' : 'available',
                        price: 0,
                        requiresApproval: false,
                        capacity: zone.tags.includes('容量大') ? 120 : 60
                    });
                 });
            }
        }
    });

    return { zones: zonesConfig.map(z => z.name), timeSlots, items };
};

// ... (Other generators remain similar but could be expanded if needed) ...
const generateLibraryData = (campus: CampusType, dateIndex: number) => {
    const isSongjiang = campus === 'songjiang';
    const baseAreas = isSongjiang 
        ? [
            { area: '一楼自修室', total: 120, tags: ['安静', '大桌'] },
            { area: '二楼阅览室', total: 100, tags: ['有书', '氛围好'] },
            { area: '二楼多媒体室', total: 60, tags: ['电脑', '网络'] },
            { area: '三楼自习室', total: 80, tags: ['考研', '插座'] },
            { area: '四楼报刊间', total: 40, tags: ['休闲', '报纸'] }
        ]
        : [
            { area: '一楼阅览室', total: 60, tags: ['安静'] },
            { area: '二楼自修区', total: 40, tags: ['插座'] },
            { area: '三楼研讨室', total: 30, tags: ['讨论'] }
        ];

    return baseAreas.map(area => {
        const seed = area.area.length + dateIndex;
        const usageRate = ((seed * 17) % 100) / 100;
        const available = Math.floor(area.total * (1 - usageRate));
        let status = 'plenty';
        if (available === 0) status = 'full';
        else if (available < area.total * 0.2) status = 'few';
        
        return { ...area, available, status };
    });
};

const generateCounselingData = (campus: CampusType, dateIndex: number) => {
    const doctors = [];
    const isSongjiang = campus === 'songjiang';
    
    if (isSongjiang) {
        if (dateIndex === 2) doctors.push({ name: '王老师', specialty: '学业压力', time: '14:00-17:00' });
        if (dateIndex === 3) doctors.push({ name: '李老师', specialty: '人际关系', time: '09:00-11:30' });
        if (dateIndex === 0 || dateIndex === 4) doctors.push({ name: '值班医生', specialty: '综合咨询', time: '13:00-16:00' });
    } else {
        if (dateIndex === 1) doctors.push({ name: '张老师', specialty: '情绪管理', time: '13:00-16:00' });
        if (dateIndex === 4) doctors.push({ name: '赵老师', specialty: '职业规划', time: '10:00-12:00' });
    }

    return {
        location: isSongjiang ? '松江大学生活动中心205' : '延安路校区心理咨询室',
        doctors
    };
};

// ... (Canteen logic remains unchanged) ...
const getDetailedCanteenOccupancy = (date: Date, offsetSeed: number = 0) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const totalM = h * 60 + m;
    if (totalM < 360 || totalM >= 1200) return 0;
    let base = 0;
    if (totalM >= 405 && totalM < 480) { base = Math.floor(50 + (totalM - 405) / 75 * 20 + Math.random() * 5); }
    else if (totalM >= 480 && totalM < 675) { base = Math.floor(20 + Math.random() * 5); }
    else if (totalM >= 675 && totalM < 695) { base = Math.floor(70 + (totalM - 675) / 20 * 20); }
    else if (totalM >= 695 && totalM < 730) { base = Math.floor(92 + Math.random() * 3); }
    else if (totalM >= 730 && totalM < 810) { base = Math.max(20, Math.floor(92 - (totalM - 730) / 80 * 72)); }
    else if (totalM >= 810 && totalM < 990) { base = Math.floor(20 + Math.random() * 5); }
    else if (totalM >= 990 && totalM < 1005) { base = Math.floor(60 + Math.random() * 10); }
    else if (totalM >= 1005 && totalM < 1055) { base = Math.floor(75 + Math.random() * 5); }
    else if (totalM >= 1055 && totalM < 1170) { base = Math.max(0, Math.floor(75 - (totalM - 1055) / 115 * 75)); }
    if (base > 0) { base = Math.max(0, Math.min(100, base + offsetSeed)); }
    return base;
};
const generateDetailedCanteenData = (campus: CampusType, canteenName: string) => {
    const now = new Date();
    const offsetSeed = (canteenName.length % 5) * 2 - 5; 
    const dataPoints: any[] = [];
    const startTime = new Date(now.getTime() - 30 * 60000);
    const endTime = new Date(now.getTime() + 60 * 60000);
    let current = new Date(startTime);
    while (current <= endTime) {
        const occ = getDetailedCanteenOccupancy(current, offsetSeed);
        const timeStr = `${current.getHours().toString().padStart(2,'0')}:${current.getMinutes().toString().padStart(2,'0')}`;
        dataPoints.push({ time: timeStr, timestamp: current.getTime(), occupancy: occ, isFuture: current > now });
        current = new Date(current.getTime() + 5 * 60000);
    }
    return { now, currentOccupancy: getDetailedCanteenOccupancy(now, offsetSeed), trend: dataPoints };
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
                        disabled={d.isPast}
                        onClick={() => onSelect(idx)}
                        className={`flex-1 min-w-[45px] flex flex-col items-center justify-center py-1.5 rounded-md text-[10px] transition-all ${
                            d.isPast 
                            ? 'text-gray-300 bg-transparent cursor-not-allowed'
                            : selectedIdx === idx 
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

// Campus Selector
const CampusSelector: React.FC<{ onSelect: (campus: CampusType) => void }> = ({ onSelect }) => (
    <div className="flex flex-col gap-2 w-full max-w-[280px] mt-2 animate-fade-in-up">
        <button 
            onClick={() => onSelect('songjiang')}
            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-dhu-red hover:shadow-md transition-all group text-left"
        >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-dhu-red group-hover:bg-dhu-red group-hover:text-white transition-colors">
                <School size={20} />
            </div>
            <div className="flex-1">
                <div className="font-bold text-gray-800 text-sm">松江校区</div>
                <div className="text-[10px] text-gray-400">Songjiang Campus</div>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-dhu-red" />
        </button>
        <button 
             onClick={() => onSelect('yanan')}
             className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-md transition-all group text-left"
        >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 size={20} />
            </div>
             <div className="flex-1">
                <div className="font-bold text-gray-800 text-sm">延安路校区</div>
                <div className="text-[10px] text-gray-400">Yan'an Road Campus</div>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-600" />
        </button>
    </div>
);

// AI Recommendation Card
const AIRecommendationCard: React.FC<{
    bestMatch: any;
    criteria?: { requirements?: string[], minCapacity?: number };
    onBook: (item: any) => void;
}> = ({ bestMatch, criteria, onBook }) => {
    if (!bestMatch) return null;
    
    // Format description of why this is recommended
    const matchedTags = bestMatch.tags?.filter((t: string) => criteria?.requirements?.some(r => t.includes(r) || r.includes(t))) || [];
    const reasonText = matchedTags.length > 0 ? `匹配特征: ${matchedTags.join('、')}` : '综合评分最高';

    return (
        <div className="mx-4 mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 flex gap-3 animate-fade-in-down">
            <div className="bg-white/80 p-2 rounded-full h-fit text-blue-600 shadow-sm">
                <Sparkles size={18} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-bold text-blue-800 mb-0.5">智能推荐</div>
                        <div className="text-sm font-bold text-gray-900">{bestMatch.name}</div>
                    </div>
                    <button 
                        onClick={() => onBook(bestMatch)}
                        className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-full font-bold hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1"
                    >
                        一键预约 <ArrowRight size={10} />
                    </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{reasonText}</span>
                    {bestMatch.capacity && <span className="text-[10px] bg-white/60 text-gray-600 px-1.5 py-0.5 rounded">容纳{bestMatch.capacity}人</span>}
                    {bestMatch.time && <span className="text-[10px] bg-white/60 text-gray-600 px-1.5 py-0.5 rounded">时段: {bestMatch.time}</span>}
                </div>
            </div>
        </div>
    );
};

// Heatmap Dashboard
const HeatmapDashboard: React.FC<{
    dataGenerator: (campus: CampusType, dateIndex: number) => any;
    initialCampus: CampusType;
    activeCampus?: CampusType;
    onCampusChange?: (campus: CampusType) => void;
    title: string;
    icon: React.ComponentType<any>;
    itemLabel: string;
    onBook: (item: any) => void;
    showPrice?: boolean;
    recommendationCriteria?: any;
}> = ({ dataGenerator, initialCampus, activeCampus, onCampusChange, title, icon, itemLabel, onBook, showPrice, recommendationCriteria }) => {
    const [localCampus, setLocalCampus] = useState<CampusType>(initialCampus);
    const campus = activeCampus !== undefined ? activeCampus : localCampus;

    const days = getNext7Days();
    const todayIdx = days.findIndex(d => d.isToday);
    const [dateIdx, setDateIdx] = useState(todayIdx !== -1 ? todayIdx : 0);
    const [selectedZone, setSelectedZone] = useState('all');
    const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
    const [bookedIds, setBookedIds] = useState<Record<string, boolean>>({});

    const handleSwitchCampus = (c: CampusType) => {
        setLocalCampus(c);
        if (onCampusChange) onCampusChange(c);
    };

    const data = dataGenerator(campus, dateIdx);
    
    // 1. Filter items first by zone selector
    let relevantItems = data.items.filter((item: any) => {
        if (selectedZone !== 'all' && item.zone !== selectedZone) return false;
        return true;
    });

    // 2. Score items for recommendation logic
    // We compute scores for all items to find the "Global Best Match" across all timeslots/zones if possible,
    // or just pass criteria down to render.
    // For the UI, we want to show a recommendation card at the top.
    
    let bestMatchItem: any = null;
    let highestScore = -Infinity;

    if (recommendationCriteria) {
        // Calculate scores
        data.items.forEach((item: any) => {
            const score = calculateScore(item, recommendationCriteria);
            item.score = score;
            if (score > highestScore && item.status === 'available') {
                highestScore = score;
                bestMatchItem = item;
            }
        });
        
        // If we have a best match, we might want to default the date/slot to it?
        // But doing so abruptly changes UI state. Better to just show the card.
    }

    // 3. Aggregate for Heatmap
    const heatmapData: Record<string, { total: number; available: number; items: any[]; hasRecommended: boolean }> = {};
    data.timeSlots.forEach((slot: string) => {
        heatmapData[slot] = { total: 0, available: 0, items: [], hasRecommended: false };
    });
    
    relevantItems.forEach((item: any) => {
        if (heatmapData[item.time]) {
            heatmapData[item.time].total++;
            if (item.status === 'available') heatmapData[item.time].available++;
            heatmapData[item.time].items.push(item);
            // Mark slot if it contains a high scoring item
            if (item.score && item.score > 0 && item.score >= highestScore - 5) {
                heatmapData[item.time].hasRecommended = true;
            }
        }
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
            <ServiceHeader title={title} icon={icon} campus={campus} onSwitchCampus={handleSwitchCampus} />
            
            {/* Intelligent Recommendation Panel */}
            {recommendationCriteria && bestMatchItem && (
                 <AIRecommendationCard 
                    bestMatch={bestMatchItem} 
                    criteria={recommendationCriteria} 
                    onBook={(item) => {
                        setBookedIds(p => ({...p, [item.id]: true}));
                        onBook(item);
                    }}
                 />
            )}

            <DateSelector selectedIdx={dateIdx} onSelect={(i) => { setDateIdx(i); setExpandedSlot(null); }} />
            
            <div className="p-4 grid grid-cols-4 gap-2">
                {data.timeSlots.map((slot: string) => {
                    const stats = heatmapData[slot];
                    const hour = parseInt(slot.split(':')[0]);
                    const isToday = dateIdx === todayIdx;
                    const isExpired = isToday && hour < new Date().getHours();

                    const ratio = stats.total > 0 ? stats.available / stats.total : 0;
                    
                    let colorClass = 'bg-gray-100 text-gray-400';
                    let label = '已满';
                    
                    if (isExpired) {
                        colorClass = 'bg-gray-200 text-gray-400 cursor-not-allowed';
                        label = '已过期';
                    } else if (stats.hasRecommended && !isExpired) {
                        // Highlight slots with recommended items
                        colorClass = 'bg-blue-100 border-blue-300 text-blue-700 ring-1 ring-blue-200';
                        label = '推荐';
                    } else {
                        if (ratio > 0.6) { colorClass = 'bg-green-50 border-green-200 text-green-700'; label = '充裕'; }
                        else if (ratio > 0) { colorClass = 'bg-orange-50 border-orange-200 text-orange-600'; label = '紧张'; }
                    }

                    const isSelected = expandedSlot === slot;
                    return (
                        <button
                            key={slot}
                            disabled={isExpired}
                            onClick={() => setExpandedSlot(isSelected ? null : slot)}
                            className={`border rounded-lg p-2 flex flex-col items-center transition-all ${isSelected ? 'ring-2 ring-dhu-red' : ''} ${colorClass} ${ratio === 0 && !isExpired ? 'opacity-70' : ''}`}
                        >
                            <span className="text-[10px] font-bold text-gray-800 mb-1">{slot.split('-')[0]}</span>
                            <span className="text-[10px] font-extrabold">{label}</span>
                            {!isExpired && !stats.hasRecommended && (
                                <div className="mt-1 w-full bg-black/5 h-1 rounded-full overflow-hidden">
                                    <div className={`h-full ${ratio === 0 ? 'bg-gray-300' : ratio > 0.6 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${ratio * 100}%` }}></div>
                                </div>
                            )}
                            {stats.hasRecommended && !isExpired && (
                                <div className="mt-1">
                                    <Sparkles size={10} className="text-blue-600 fill-blue-600" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {expandedSlot && (
                <div className="border-t border-gray-100 bg-gray-50 p-3 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
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
                            .sort((a,b) => {
                                // Sort by score first (if exists), then availability
                                if (a.score !== b.score) return (b.score || 0) - (a.score || 0);
                                return a.status === 'available' ? -1 : 1;
                            })
                            .map((item: any) => (
                             <div key={item.id} className={`p-2 rounded border flex justify-between items-center shadow-sm ${item.score > 0 && item.status === 'available' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                                 <div>
                                     <div className="flex items-center gap-2">
                                         <div className="text-xs font-bold text-gray-900">{item.name}</div>
                                         {item.score > 0 && item.status === 'available' && <span className="text-[9px] bg-blue-600 text-white px-1 rounded flex items-center gap-0.5"><Sparkles size={8}/> 推荐</span>}
                                     </div>
                                     
                                     {showPrice && (
                                         <div className="text-[10px] font-medium mt-0.5">
                                             {item.price === 0 ? <span className="text-green-600 font-bold">免费</span> : <span className="text-gray-900">¥{item.price}</span>}
                                         </div>
                                     )}
                                     
                                     <div className="flex gap-1 mt-1 flex-wrap max-w-[180px]">
                                        {item.capacity && <span className="text-[9px] bg-gray-100 text-gray-600 px-1 rounded">容纳{item.capacity}人</span>}
                                        {item.tags?.map((f:string, i:number) => (
                                            <span key={i} className={`text-[9px] px-1 rounded ${recommendationCriteria?.requirements?.some((r:string) => f.includes(r)) ? 'bg-yellow-100 text-yellow-700 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                                                {f}
                                            </span>
                                        ))}
                                     </div>
                                 </div>
                                 {item.status === 'available' ? (
                                     <button
                                        disabled={bookedIds[item.id]}
                                        onClick={() => {
                                            setBookedIds(p => ({...p, [item.id]: true}));
                                            onBook(item);
                                        }}
                                        className={`text-[10px] px-3 py-1.5 rounded font-bold transition-colors ${
                                            bookedIds[item.id] 
                                                ? 'bg-green-100 text-green-700 flex items-center gap-1' 
                                                : item.requiresApproval 
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                    : 'bg-dhu-red text-white hover:bg-[#85021a]'
                                        }`}
                                     >
                                         {bookedIds[item.id] ? <><CheckCircle2 size={10}/>已成功</> : (item.requiresApproval ? '申请审批' : '预约')}
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

// ... (CanteenView, CollegeList remain same) ...
const CanteenView: React.FC<{ initialCampus: CampusType }> = ({ initialCampus }) => {
    const [campus, setCampus] = useState<CampusType>(initialCampus);
    const [selectedCanteen, setSelectedCanteen] = useState(CANTEEN_FLOORS[0]);
    const data = useMemo(() => generateDetailedCanteenData(campus, selectedCanteen), [campus, selectedCanteen]);
    
    // Visualization constants
    const WIDTH = 300;
    const HEIGHT = 80;
    
    // Check closed status first (Between 20:00 and 06:00)
    const currentHour = data.now.getHours();
    const isClosed = currentHour >= 20 || currentHour < 6;

    // Status Logic
    let statusColor = 'text-green-600';
    let dotColor = 'bg-green-500';
    let statusText = '空闲';
    
    if (isClosed) {
        statusColor = 'text-gray-400';
        dotColor = 'bg-gray-300';
        statusText = '已关闭';
    } else {
        if(data.currentOccupancy > 40) { statusColor = 'text-yellow-600'; dotColor = 'bg-yellow-500'; statusText = '适中'; }
        if(data.currentOccupancy > 75) { statusColor = 'text-red-600'; dotColor = 'bg-dhu-red'; statusText = '拥挤'; }
    }

    // Recommendation Logic (Simple AI)
    const getRecommendation = () => {
        if (isClosed) {
            return { text: '目前食堂已关闭状态。', type: 'closed' };
        }
        if (data.currentOccupancy > 75) {
            // Find next point where occupancy < 60
            const futurePoints = data.trend.filter(p => p.isFuture);
            const betterTime = futurePoints.find(p => p.occupancy < 60);
            if (betterTime) {
                const diffMins = Math.round((betterTime.timestamp - data.now.getTime()) / 60000);
                return {
                    text: `当前${selectedCanteen}拥挤 (${data.currentOccupancy}%). 预测 ${diffMins} 分钟后降至 ${betterTime.occupancy}%，建议错峰前往。`,
                    bestTime: betterTime.time,
                    type: 'wait'
                };
            }
            return { text: '当前极度拥挤，建议前往其他食堂或打包。', type: 'alert' };
        } else if (data.currentOccupancy < 40) {
            return { text: '当前食堂座位充足，是就餐的好时机。', type: 'good' };
        }
        return { text: '当前人流适中，排队预计需 3-5 分钟。', type: 'normal' };
    };

    const recommendation = getRecommendation();

    // SVG Path Generation
    const points = data.trend.map((p, i) => {
        const x = (i / (data.trend.length - 1)) * WIDTH;
        const y = HEIGHT - (p.occupancy / 100) * HEIGHT; // Flip Y
        return { x, y, ...p };
    });

    // Generate Path String
    const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    
    // Find "Now" point coordinates
    const nowPointIndex = data.trend.findIndex(p => !p.isFuture) || 0;
    
    // Find the closest point to "Now"
    let closestPoint = points[0];
    let minDiff = Infinity;
    points.forEach(p => {
        const diff = Math.abs(p.timestamp - data.now.getTime());
        if(diff < minDiff) { minDiff = diff; closestPoint = p; }
    });
    
    // Split points into past and future for separate styling (Solid vs Dashed)
    const pastPoints = points.filter(p => p.timestamp <= closestPoint.timestamp);
    const futurePoints = points.filter(p => p.timestamp >= closestPoint.timestamp);
    
    const pastPathD = pastPoints.length > 1 ? `M ${pastPoints.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    const futurePathD = futurePoints.length > 1 ? `M ${futurePoints.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    
    // Fill Area
    const fillPathD = `M 0,${HEIGHT} L ${points[0].x},${points[0].y} ` + 
                      points.map(p => `L ${p.x},${p.y}`).join(' ') + 
                      ` L ${WIDTH},${HEIGHT} Z`;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
            <ServiceHeader title="食堂实时报告" icon={Utensils} campus={campus} onSwitchCampus={setCampus} />
            
            <div className="p-5">
                {/* Header Status */}
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <select 
                                value={selectedCanteen}
                                onChange={(e) => setSelectedCanteen(e.target.value)}
                                className="text-xs text-gray-900 border border-gray-300 rounded px-2 py-1 outline-none focus:border-dhu-red bg-white font-bold"
                             >
                                {CANTEEN_FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
                             </select>
                             <span className="text-gray-400 text-xs">(实时)</span>
                        </div>
                        <div className={`text-3xl font-extrabold flex items-baseline gap-2 ${statusColor}`}>
                            {isClosed ? '0' : data.currentOccupancy}%
                            <span className={`text-sm px-2 py-0.5 rounded-full text-white font-bold ${dotColor} translate-y-[-2px]`}>
                                {statusText}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="text-xs text-gray-400">更新时间</div>
                         <div className="text-sm font-bold text-gray-700">{data.now.getHours().toString().padStart(2,'0')}:{data.now.getMinutes().toString().padStart(2,'0')}</div>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative h-[100px] w-full mb-6 select-none">
                    <svg viewBox={`0 -10 ${WIDTH} ${HEIGHT + 20}`} className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="gradientOpacity" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={statusColor.replace('text-', '') === 'text-dhu-red' ? '#A0021F' : (statusColor.includes('gray') ? '#9ca3af' : '#16a34a')} stopOpacity="0.1" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        
                        {/* Background Fill */}
                        <path d={fillPathD} fill="url(#gradientOpacity)" stroke="none" />

                        {/* Dashed Future Line */}
                        <path d={futurePathD} fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                        
                        {/* Solid Past Line */}
                        <path d={pastPathD} fill="none" stroke={statusColor.replace('text-', '') === 'text-dhu-red' ? '#A0021F' : (statusColor.includes('yellow') ? '#ca8a04' : (statusColor.includes('gray') ? '#9ca3af' : '#16a34a'))} strokeWidth="3" strokeLinecap="round" />
                        
                        {/* Best Entry Point (if exists) */}
                        {recommendation.type === 'wait' && recommendation.bestTime && (() => {
                            const bestP = futurePoints.find(p => p.time === recommendation.bestTime);
                            if (bestP) return (
                                <g transform={`translate(${bestP.x}, ${bestP.y})`}>
                                    <circle r="3" fill="#16a34a" />
                                    <rect x="-24" y="-22" width="48" height="16" rx="4" fill="#16a34a" />
                                    <text x="0" y="-11" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">最佳进入</text>
                                </g>
                            )
                        })()}

                        {/* Breathing Dot at Current Time */}
                        <g transform={`translate(${closestPoint.x}, ${closestPoint.y})`}>
                            <circle r="6" className={`${statusColor.replace('text-', 'text-')} opacity-30 animate-ping`} fill="currentColor" />
                            <circle r="4" className={statusColor.replace('text-', 'text-')} fill="currentColor" />
                            <circle r="2" fill="white" />
                        </g>
                    </svg>
                    
                    {/* X Axis Labels */}
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>-30分</span>
                        <span>现在</span>
                        <span>+60分</span>
                    </div>
                </div>

                {/* AI Recommendation Box */}
                <div className={`rounded-lg p-3 flex gap-3 items-start ${
                    recommendation.type === 'alert' ? 'bg-red-50 border border-red-100' : 
                    recommendation.type === 'wait' ? 'bg-blue-50 border border-blue-100' : 
                    recommendation.type === 'closed' ? 'bg-gray-50 border border-gray-200' :
                    'bg-green-50 border border-green-100'
                }`}>
                    <div className={`mt-0.5 p-1 rounded-full text-white shrink-0 ${
                         recommendation.type === 'alert' ? 'bg-red-400' : 
                         recommendation.type === 'wait' ? 'bg-blue-400' : 
                         recommendation.type === 'closed' ? 'bg-gray-400' : 'bg-green-400'
                    }`}>
                        {recommendation.type === 'wait' ? <TrendingDown size={14} /> : <Bot size={14} />}
                    </div>
                    <div>
                        <div className={`text-xs font-bold mb-0.5 ${
                            recommendation.type === 'alert' ? 'text-red-800' : 
                            recommendation.type === 'wait' ? 'text-blue-800' : 
                            recommendation.type === 'closed' ? 'text-gray-800' : 'text-green-800'
                        }`}>校园助手建议</div>
                        <div className={`text-xs leading-relaxed ${
                            recommendation.type === 'alert' ? 'text-red-600' : 
                            recommendation.type === 'wait' ? 'text-blue-600' : 
                            recommendation.type === 'closed' ? 'text-gray-600' : 'text-green-600'
                        }`}>
                            {recommendation.text}
                        </div>
                        {recommendation.bestTime && (
                             <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold bg-white/60 px-2 py-1 rounded text-blue-700">
                                 <ArrowRight size={10} /> 建议出发时间: {recommendation.bestTime}
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CollegeList: React.FC<{ initialCampus: CampusType }> = ({ initialCampus }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Reset expansion state when campus changes
    useEffect(() => {
        setExpanded(false);
    }, [initialCampus]);

    const colleges = DHU_COLLEGES.filter(c => c.campus === initialCampus);
    const displayList = expanded ? colleges : colleges.slice(0, 10);
    const remainingCount = Math.max(0, colleges.length - 10);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 p-5">
             <div className="text-base font-bold text-gray-600 mb-4 tracking-wide">常用学院导航 ({initialCampus === 'songjiang' ? '松江' : '延安路'})</div>
             <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 {displayList.map(c => (
                     <a key={c.name} href={c.url} target="_blank" rel="noreferrer" className="text-sm text-gray-700 hover:text-dhu-red truncate block hover:underline">
                         {c.name}
                     </a>
                 ))}
             </div>
             {remainingCount > 0 && !expanded && (
                 <div onClick={() => setExpanded(true)} className="text-center text-sm text-dhu-red mt-6 cursor-pointer hover:bg-red-50 py-2 rounded transition-colors font-bold select-none">
                     选择更多学院
                 </div>
             )}
             {expanded && (
                 <div onClick={() => setExpanded(false)} className="text-center text-sm text-gray-400 mt-6 cursor-pointer hover:bg-gray-50 py-2 rounded transition-colors select-none">
                     收起
                 </div>
             )}
        </div>
    );
};

const MeetingView: React.FC<{ initialCampus: CampusType, criteria?: any, onBook: (item: any) => void }> = ({ initialCampus, criteria, onBook }) => {
    const [campus, setCampus] = useState<CampusType>(initialCampus);
    
    return (
        <>
            <HeatmapDashboard 
                title="会议室预约" 
                icon={Building2} 
                itemLabel="会议室" 
                initialCampus={initialCampus}
                activeCampus={campus}
                onCampusChange={setCampus}
                dataGenerator={(c, d) => generateMeetingData(c, d)}
                onBook={onBook}
                recommendationCriteria={criteria}
            />
            <CollegeList initialCampus={campus} />
        </>
    );
};

// ... (LibraryView, CounselingView) ...
const LibraryView: React.FC<{ initialCampus: CampusType, onBook: (item: any) => void }> = ({ initialCampus, onBook }) => {
     const [campus, setCampus] = useState<CampusType>(initialCampus);
     const data = generateLibraryData(campus, 0);

     return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
            <ServiceHeader title="图书馆座位" icon={LayoutGrid} campus={campus} onSwitchCampus={setCampus} />
            <div className="p-4 grid grid-cols-1 gap-3">
                {data.map((area: any) => (
                    <div key={area.area} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                        <div>
                            <div className="text-sm font-bold text-gray-800">{area.area}</div>
                            <div className="text-xs text-gray-500 mt-0.5">剩余 {area.available} / 总座 {area.total}</div>
                            <div className="flex gap-1 mt-1">
                                {area.tags?.map((t:string) => <span key={t} className="text-[9px] bg-gray-50 text-gray-400 px-1 rounded">{t}</span>)}
                            </div>
                        </div>
                        <button 
                            onClick={() => onBook({ name: `图书馆 ${area.area} 座位`, time: '立即', requiresApproval: false })}
                            disabled={area.available === 0}
                            className={`px-3 py-1.5 rounded text-xs font-bold ${area.available === 0 ? 'bg-gray-100 text-gray-400' : 'bg-dhu-red text-white hover:bg-[#85021a]'}`}
                        >
                            {area.available === 0 ? '已满' : '选座'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
     );
};

const CounselingView: React.FC<{ initialCampus: CampusType, onBook: (item: any) => void }> = ({ initialCampus, onBook }) => {
    const [campus, setCampus] = useState<CampusType>(initialCampus);
    const [dateIdx, setDateIdx] = useState(0); 
    const days = getNext7Days();
    const data = generateCounselingData(campus, dateIdx);

    return (
       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full mb-4 animate-fade-in-up">
           <ServiceHeader title="心理咨询预约" icon={HeartHandshake} campus={campus} onSwitchCampus={setCampus} />
           <DateSelector selectedIdx={dateIdx} onSelect={setDateIdx} />
           <div className="p-4">
               <div className="bg-blue-50 text-blue-700 p-2 rounded text-xs mb-3 flex items-start gap-2">
                   <MapPin size={14} className="mt-0.5 shrink-0"/>
                   <span>地点：{data.location}</span>
               </div>
               {data.doctors.length > 0 ? (
                   <div className="space-y-3">
                       {data.doctors.map((doc: any, i: number) => (
                           <div key={i} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded shadow-sm">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                       <User size={20} />
                                   </div>
                                   <div>
                                       <div className="font-bold text-sm text-gray-900">{doc.name}</div>
                                       <div className="text-xs text-gray-500">{doc.specialty}</div>
                                       <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={10}/> {doc.time}</div>
                                   </div>
                               </div>
                               <button 
                                   onClick={() => onBook({ name: `心理咨询-${doc.name}`, time: `${days[dateIdx].date} ${doc.time}`, requiresApproval: true })}
                                   className="bg-dhu-red text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-[#85021a]"
                               >
                                   预约
                               </button>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="text-center py-8 text-gray-400 text-xs">
                       本日暂无排班，请切换日期查看
                   </div>
               )}
           </div>
       </div>
    );
};

// --- Main Modal ---
const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose, initialIntent }) => {
  const INITIAL_MESSAGES: Message[] = [
      { id: 'init', sender: 'bot', text: '你好！我是你的校园助手。\n我可以帮你智能推荐合适的教室、会议室或运动场。你可以试试问我：\n"我要一间安静的教室自习"\n"帮我找个能容纳6人的投影会议室"', timestamp: new Date() }
  ];

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [apiKey, setApiKey] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [configInput, setConfigInput] = useState('');
  
  const [preferredCampus, setPreferredCampus] = useState<CampusType | null>(null);
  
  const lastProcessedIntent = useRef<string | null>(null);

  useEffect(() => {
      const storedKey = localStorage.getItem('siliconflow_api_key');
      if (storedKey) {
          setApiKey(storedKey);
      } else {
          setShowConfig(true);
      }
  }, []);
  
  const showToast = (message: string) => {
      setToast(message);
      setTimeout(() => setToast(null), 3000);
  };

  const handleSaveKey = () => {
      if (!configInput.trim()) return;
      localStorage.setItem('siliconflow_api_key', configInput.trim());
      setApiKey(configInput.trim());
      setShowConfig(false);
      setConfigInput('');
      showToast('API Key 已保存');
  };

  const handleResetKey = () => {
      localStorage.removeItem('siliconflow_api_key');
      setApiKey('');
      setShowConfig(true);
  };

  useEffect(() => {
    if (!isOpen) {
        setMessages(INITIAL_MESSAGES);
        lastProcessedIntent.current = null;
        setInput('');
        setToast(null);
        setPreferredCampus(null);
    }
  }, [isOpen]);

  useEffect(() => {
      if (isOpen && initialIntent && lastProcessedIntent.current !== initialIntent && apiKey) {
          lastProcessedIntent.current = initialIntent;
          setMessages(p => [...p, { id: Date.now().toString(), sender: 'user', text: initialIntent, timestamp: new Date() }]);
          processAI(initialIntent);
      }
  }, [isOpen, initialIntent, apiKey]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const processAI = async (text: string, isSystemEvent: boolean = false) => {
      if (!apiKey) {
          setShowConfig(true);
          return;
      }
      
      setIsTyping(true);
      try {
          const lowerInput = text.toLowerCase();
          const college = findCollegeByInput(lowerInput);
          
          if (college && !isSystemEvent) {
             if (college.campus) setPreferredCampus(college.campus as CampusType);
             if (lowerInput.includes('会议') || lowerInput.includes('预约') || lowerInput.includes('场地')) {
                    setMessages(p => [...p, { 
                        id: Date.now().toString(), 
                        sender: 'bot', 
                        text: `为您找到${college.name}的内部会议室预约通道。请点击下方链接跳转至学院官网进行申请。`, 
                        richData: { type: 'single_college_link', title: college.name, data: college },
                        timestamp: new Date() 
                    }]);
                    setIsTyping(false);
                    return;
             }
          }

          if (isSystemEvent) {
               const nameMatch = text.match(/:\s+(.+)\s+at/);
               const name = nameMatch ? nameMatch[1] : '';
               const responseText = `预约成功！\n地点：${name}\n请准时签到使用。`;
               setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: responseText, timestamp: new Date() }]);
               setIsTyping(false);
               return;
          }

          const tools = [
              {
                  type: "function",
                  function: {
                      name: "request_campus_selection",
                      description: "Request the user to select a campus.",
                      parameters: { type: "object", properties: {} }
                  }
              },
              {
                  type: "function",
                  function: {
                      name: "search_sports",
                      description: "Search sports venues with intelligent recommendation.",
                      parameters: {
                          type: "object",
                          properties: {
                              sport: { type: "string" },
                              campus: { type: "string" },
                              requirements: { type: "string", description: "Keywords for attributes like 'indoor', 'outdoor', 'professional'." }
                          }
                      }
                  }
              },
              {
                  type: "function",
                  function: {
                      name: "search_meeting",
                      description: "Search meeting rooms with intelligent recommendation.",
                      parameters: {
                          type: "object",
                          properties: {
                              campus: { type: "string" },
                              min_capacity: { type: "number" },
                              requirements: { type: "string", description: "Keywords like 'projector', 'quiet', 'multimedia'." }
                          }
                      }
                  }
              },
              {
                  type: "function",
                  function: {
                      name: "search_classroom",
                      description: "Search classrooms with intelligent recommendation.",
                      parameters: {
                          type: "object",
                          properties: {
                              campus: { type: "string" },
                              requirements: { type: "string", description: "Keywords like 'quiet', 'near canteen', 'large capacity'." }
                          }
                      }
                  }
              },
              {
                  type: "function",
                  function: {
                      name: "search_counseling",
                      description: "Search counseling",
                      parameters: {
                          type: "object",
                          properties: {
                              campus: { type: "string" }
                          }
                      }
                  }
              },
              {
                  type: "function",
                  function: {
                      name: "search_canteen",
                      description: "Search canteen flow",
                      parameters: {
                          type: "object",
                          properties: {
                              campus: { type: "string" }
                          }
                      }
                  }
              },
              {
                  type: "function",
                  function: {
                      name: "find_college",
                      description: "Find college url",
                      parameters: {
                          type: "object",
                          properties: {
                              name: { type: "string" }
                          },
                          required: ['name']
                      }
                  }
              },
              {
                  type: "function",
                  function: {
                      name: "search_library",
                      description: "Search library",
                      parameters: {
                          type: "object",
                          properties: {
                              campus: { type: "string" }
                          }
                      }
                  }
              }
          ];

          const systemPrompt = `你是一个东华大学校园助手。
                校区：松江校区、延安路校区。
                ${preferredCampus ? `当前上下文校区: ${preferredCampus === 'songjiang' ? '松江' : '延安路'}` : ''}

                **智能推荐指令**:
                当用户提出需求（如"安静"、"离食堂近"、"有投影"、"6个人"）时，请务必提取这些特征到工具参数中。
                
                规则:
                1. 问体育 -> search_sports(requirements="室内/室外/专业"等)
                2. 问会议 -> search_meeting(min_capacity=人数, requirements="投影/白板/安静"等)
                3. 问教室 -> search_classroom(requirements="安静/离食堂近/插座"等)
                4. 缺校区 -> request_campus_selection
                
                直接调用工具，不要反问。`;

          const apiMessages = [
              { role: "system", content: systemPrompt },
              ...messages.filter(m => m.id !== 'init').map(m => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: m.text || ''
              })),
              { role: "user", content: text }
          ];

          const response = await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ model: MODEL_NAME, messages: apiMessages, tools: tools, stream: false })
          });

          if (!response.ok) throw new Error("API Error");

          const data = await response.json();
          const choice = data.choices?.[0];
          const responseMessage = choice?.message;

          if (!responseMessage) return;

          if (responseMessage.tool_calls) {
              const toolCall = responseMessage.tool_calls[0];
              const functionName = toolCall.function.name;
              let args: any = {};
              try { args = JSON.parse(toolCall.function.arguments); } catch (e) {}

              let rich: RichData | undefined;
              let displayText = "为您查询到相关信息：";

              let campus: CampusType = preferredCampus || 'songjiang';
              if (args.campus) {
                  campus = (args.campus.includes('yan') || args.campus.includes('延安')) ? 'yanan' : 'songjiang';
                  setPreferredCampus(campus);
              }

              // Extract criteria for recommendation
              const criteria = {
                  requirements: args.requirements ? args.requirements.split(/[,，\s]+/) : [],
                  minCapacity: args.min_capacity,
              };

              switch (functionName) {
                  case 'request_campus_selection':
                       rich = { type: 'campus_selector', title: '选择校区', data: {} };
                       displayText = "请选择您所在的校区：";
                       break;
                  case 'search_canteen': 
                       rich = { type: 'canteen_view', title: '食堂人流量', data: { campus } }; 
                       break;
                  case 'search_counseling': 
                       rich = { type: 'counseling_view', title: '心理咨询', data: { campus } }; 
                       break;
                  case 'search_library': 
                       rich = { type: 'library_view', title: '图书馆', data: { campus } }; 
                       break;
                  case 'search_classroom': 
                       rich = { 
                           type: 'classroom_view', 
                           title: '教室预约', 
                           data: { campus },
                           recommendationCriteria: criteria 
                       }; 
                       displayText = criteria.requirements.length > 0 ? `根据您的需求 (${criteria.requirements.join('、')})，为您推荐以下教室：` : "为您查询到空闲教室：";
                       break;
                  case 'search_meeting': 
                       rich = { 
                           type: 'meeting_view', 
                           title: '会议室', 
                           data: { campus },
                           recommendationCriteria: criteria
                       }; 
                       displayText = criteria.requirements.length > 0 ? `为您找到满足条件 (${criteria.requirements.join('、')}) 的会议室：` : "为您查询到会议室资源：";
                       break;
                  case 'search_sports': 
                       rich = { 
                           type: 'sports_view', 
                           title: args.sport || '运动场', 
                           data: { sport: args.sport || '羽毛球', campus },
                           recommendationCriteria: criteria
                       }; 
                       break;
                  case 'find_college': 
                       const c = findCollegeByInput(args.name);
                       if (c) {
                           rich = { type: 'single_college_link', title: c.name, data: c };
                           displayText = "为您找到该学院官网，请前往预约：";
                       } else {
                           displayText = "未找到该学院信息。";
                       }
                       break;
                  default:
                       displayText = "不支持的请求类型。";
              }
              
              setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: displayText, richData: rich, timestamp: new Date() }]);
          } else {
              setMessages(p => [...p, { id: Date.now().toString(), sender: 'bot', text: responseMessage.content, timestamp: new Date() }]);
          }
      } catch (e) {
          showToast("服务暂不可用，请检查网络或API Key");
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

  const handleCampusSelect = (c: CampusType) => {
      setPreferredCampus(c);
      const text = c === 'songjiang' ? '松江校区' : '延安路校区';
      setMessages(p => [...p, { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() }]);
      processAI(text);
  };

  const handleBookingTrigger = (item: any, type: string) => {
      const action = item.requiresApproval ? 'submitted application for' : 'booked';
      const prompt = `[SYSTEM_EVENT] User ${action} ${type}: ${item.name} at ${item.time}.`;
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
                    <span className="font-bold text-gray-800">校园助手</span>
                </div>
                <div className="flex items-center gap-2">
                    {!showConfig && apiKey && (
                        <button onClick={handleResetKey} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100" title="设置API Key">
                            <Settings size={18} />
                        </button>
                    )}
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
            </div>

            {/* Config Overlay */}
            {showConfig && (
                <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                    <div className="bg-dhu-red/10 p-4 rounded-full mb-4">
                        <Key className="w-8 h-8 text-dhu-red" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">配置 AI 智能助手</h2>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs">
                        请输入您的 SiliconFlow API Key 以启用智能服务。
                    </p>
                    <input 
                        type="password"
                        value={configInput}
                        onChange={(e) => setConfigInput(e.target.value)}
                        placeholder="sk-..."
                        className="w-full max-w-sm px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-dhu-red focus:border-transparent outline-none transition-all"
                    />
                    <button 
                        onClick={handleSaveKey}
                        disabled={!configInput.trim()}
                        className="w-full max-w-sm bg-dhu-red text-white font-bold py-3 rounded-lg hover:bg-[#85021a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        开始使用
                    </button>
                    <a href="https://cloud.siliconflow.cn/" target="_blank" rel="noreferrer" className="text-xs text-blue-500 mt-4 hover:underline flex items-center gap-1">获取 API Key <ExternalLink size={10} /></a>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
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
                                     {m.richData.type === 'campus_selector' && (
                                         <CampusSelector onSelect={handleCampusSelect} />
                                     )}
                                     {m.richData.type === 'canteen_view' && (
                                         <CanteenView initialCampus={m.richData.data.campus} />
                                     )}
                                     {m.richData.type === 'sports_view' && (
                                         <HeatmapDashboard 
                                            title={m.richData.title} 
                                            icon={BarChart3} 
                                            itemLabel="场地" 
                                            initialCampus={m.richData.data.campus}
                                            dataGenerator={(c, d) => generateSportsData(m.richData!.data.sport, c, d)}
                                            onBook={(item) => handleBookingTrigger(item, 'sports')}
                                            showPrice={true}
                                            recommendationCriteria={m.richData.recommendationCriteria}
                                         />
                                     )}
                                     {m.richData.type === 'meeting_view' && (
                                         <MeetingView 
                                            initialCampus={m.richData.data.campus}
                                            onBook={(item) => handleBookingTrigger(item, 'meeting')}
                                            criteria={m.richData.recommendationCriteria}
                                         />
                                     )}
                                     {m.richData.type === 'classroom_view' && (
                                         <HeatmapDashboard 
                                            title="教室预约" 
                                            icon={School} 
                                            itemLabel="教室" 
                                            initialCampus={m.richData.data.campus}
                                            dataGenerator={(c, d) => generateClassroomData(c, d)}
                                            onBook={(item) => handleBookingTrigger(item, 'classroom')}
                                            recommendationCriteria={m.richData.recommendationCriteria}
                                         />
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
                {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 ml-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>正在智能分析需求...</span>
                    </div>
                )}
                <div ref={scrollRef} />
                
                {toast && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
                        <div className="bg-gray-800 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg animate-fade-in-up flex items-center gap-2">
                            <AlertCircle size={14} className="text-red-400"/>
                            {toast}
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t">
                <div className="relative">
                    <input 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-dhu-red placeholder-gray-500 disabled:opacity-50"
                        placeholder="请输入需求（如：安静的自习教室、6人投影会议室）"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUserSend()}
                        disabled={showConfig}
                    />
                    <button onClick={handleUserSend} disabled={showConfig} className="absolute right-1 top-1 p-1 bg-dhu-red text-white rounded-full disabled:bg-gray-300"><Send size={16}/></button>
                </div>
                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
                    {SUGGESTIONS.map(t => (
                        <button 
                            key={t} 
                            disabled={showConfig}
                            onClick={() => { 
                                setMessages(p => [...p, { id: Date.now().toString(), sender: 'user', text: t, timestamp: new Date() }]);
                                processAI(t);
                            }} 
                            className="whitespace-nowrap px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-700 hover:text-dhu-red hover:border-dhu-red disabled:opacity-50"
                        >
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