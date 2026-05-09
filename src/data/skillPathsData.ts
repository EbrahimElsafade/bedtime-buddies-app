export const skillPathsData = [
  {
    icon: '💻',
    title: 'مسار التقنية والبرمجة',
    description:
      'Scratch، Python للأطفال، الذكاء الاصطناعي، وبناء المواقع — كل ما يحتاجه جيل المستقبل.',
    progress: 75,
    coursesCount: 224,
  },
  {
    icon: '🎨',
    title: 'مسار الإبداع والفنون',
    description:
      'رسم، تصميم، شطرنج، وفنون متعددة لتنمية الجانب الإبداعي والتحليلي.',
    progress: 45,
    coursesCount: 156,
  },
  {
    icon: '🧠',
    title: 'مسار المهارات الحياتية',
    description:
      'الحدود الشخصية، مواجهة التنمر، الثقة بالنفس — مهارات ضرورية لكل مرحلة.',
    progress: 60,
    coursesCount: 89,
  },
]

export const skillPathsMiniData = skillPathsData.map(path => ({
  icon: path.icon,
  title: path.title,
  subtitle: `${path.coursesCount} دروس`,
}))
