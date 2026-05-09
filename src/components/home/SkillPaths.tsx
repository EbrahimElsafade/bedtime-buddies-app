import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import SkillPathCard from './SkillPathCard'

const skillPathsData = [
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

const SkillPaths = () => {
  const { t } = useTranslation(['misc'])

  return (
    <section className="relative bg-background/70 px-4 py-12">
      <div className="container mx-auto">
        {/* Header */}
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <h2 className="text-lg text-primary-foreground md:text-3xl">
            مسارات المهارات
          </h2>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {skillPathsData.map((path, index) => (
            <SkillPathCard
              key={index}
              icon={path.icon}
              title={path.title}
              description={path.description}
              progress={path.progress}
              coursesCount={path.coursesCount}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-4 flex items-center justify-center">
          <Link to="/skill-paths">
            <Button variant="accent">عرض المزيد</Button>
          </Link>
        </div>
      </div>

      {/* top Fun decorative elements for skill paths section */}
      <div className="pointer-events-none absolute left-0 top-0 w-full overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="opacity-10"
        >
          <path
            fill="#7dd3fc"
            fillOpacity="1"
            d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,171,864,186.7C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      {/* bottom Fun decorative elements specific to this section */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="opacity-10"
        >
          <path
            fill="#7dd3fc"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,218.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  )
}

export default SkillPaths
