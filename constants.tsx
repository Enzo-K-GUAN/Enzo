
import React from 'react';

export const EVALUATION_LABELS = {
  understanding: '理解与复述',
  creation: '创作表现',
  collaboration: '亲子协作',
  expression: '表达与交流',
  aiUsage: 'AIGC应用'
};

export const EVALUATION_DETAILS = {
  understanding: '关联：语文理解能力、批判性思维',
  creation: '关联：创新能力、审美素养',
  collaboration: '关联：社会情感能力、合作能力',
  expression: '关联：表达与沟通能力',
  aiUsage: '关联：信息素养、数字技术应用能力'
};

export const STORY_CONTENT = {
  title: '牛郎织女',
  school: '五河县第三小学',
  introduction: '融合AIGC与多元评价：开启家校协同育人新范式',
  chapters: [
    {
      id: 1,
      title: '第一课时：教学引领，形成共识',
      subtitle: '多感官沉浸，构建共同的故事世界',
      steps: ['多媒体感知', '共同阅读体验', '文字与词语理解'],
      tasks: [
        { id: 't1', name: '词语显微镜', desc: '利用AI理解“彩锦”、“机房”等关键词', icon: 'Search' },
        { id: 't2', name: '句子复述墙', desc: '家长与学生用自己的话讲述情节', icon: 'Mic' }
      ]
    },
    {
      id: 2,
      title: '第二课时：实践驱动，多元表达',
      subtitle: '多学科融合，在协同创造中深化理解',
      steps: ['任务实践', '延伸活动', '综合表达', '多元评价'],
      tasks: [
        { id: 't3', name: '绘画与手工', desc: '选择“牛郎照顾老牛”进行创作', icon: 'Palette' },
        { id: 't4', name: '角色扮演', desc: '表演“老牛说话”等经典情节', icon: 'Video' }
      ]
    }
  ],
  vocab: [
    { word: '彩锦', explanation: '彩锦就是神仙在天上织出来的、有各种颜色的漂亮布匹。', prompt: '请用图片和简单的语言解释什么是“彩锦”？' },
    { word: '机房', explanation: '古代专门用来织布的工作间，织女在这里织出绚丽的锦缎。', prompt: '展示古代织布机房的样子。' }
  ]
};

export const MOCK_WORKS = [
  {
    id: '1',
    studentName: '王小明',
    title: '牛郎照顾老牛',
    imageUrl: 'https://picsum.photos/seed/ming1/400/300',
    description: '我和爸爸一起画的，牛郎正在给老牛刷毛。',
    likes: 32,
    tags: ['情感表达', '创意力'],
    stats: { understanding: 80, creation: 90, collaboration: 95, expression: 70, aiUsage: 85 }
  },
  {
    id: '2',
    studentName: '李华',
    title: '喜鹊搭桥',
    imageUrl: 'https://picsum.photos/seed/hua1/400/300',
    description: '用了AI生成的喜鹊素材作为参考，画出了银河。',
    likes: 45,
    tags: ['审美素养', 'AIGC应用'],
    stats: { understanding: 70, creation: 85, collaboration: 80, expression: 90, aiUsage: 95 }
  }
];
