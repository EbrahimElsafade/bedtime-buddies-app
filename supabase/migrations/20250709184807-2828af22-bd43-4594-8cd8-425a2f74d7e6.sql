
-- Update existing stories with multilingual titles and descriptions
-- First, let's update some sample stories with Arabic translations

-- Update story titles and descriptions with multilingual content
UPDATE public.stories 
SET 
  title = jsonb_build_object(
    'en', COALESCE(title->>'en', title::text),
    'ar-eg', CASE 
      WHEN title->>'en' LIKE '%Moon%' OR title->>'en' LIKE '%Adventure%' THEN 'مغامرة ضوء القمر'
      WHEN title->>'en' LIKE '%Bear%' OR title->>'en' LIKE '%Sleepy%' THEN 'الدب النعسان'
      WHEN title->>'en' LIKE '%Star%' OR title->>'en' LIKE '%Wish%' THEN 'أمنيات ضوء النجوم'
      WHEN title->>'en' LIKE '%Light%' OR title->>'en' LIKE '%Brave%' THEN 'الضوء الشجاع الصغير'
      WHEN title->>'en' LIKE '%Flying%' OR title->>'en' LIKE '%Dream%' THEN 'أحلام الطيران'
      ELSE 'قصة جميلة'
    END,
    'ar-fos7a', CASE 
      WHEN title->>'en' LIKE '%Moon%' OR title->>'en' LIKE '%Adventure%' THEN 'مغامرة نور القمر'
      WHEN title->>'en' LIKE '%Bear%' OR title->>'en' LIKE '%Sleepy%' THEN 'الدب النائم'
      WHEN title->>'en' LIKE '%Star%' OR title->>'en' LIKE '%Wish%' THEN 'أمنيات النجوم'
      WHEN title->>'en' LIKE '%Light%' OR title->>'en' LIKE '%Brave%' THEN 'النور الشجاع الصغير'
      WHEN title->>'en' LIKE '%Flying%' OR title->>'en' LIKE '%Dream%' THEN 'أحلام التحليق'
      ELSE 'حكاية رائعة'
    END
  ),
  description = jsonb_build_object(
    'en', COALESCE(description->>'en', description::text),
    'ar-eg', CASE 
      WHEN description->>'en' LIKE '%Luna%' OR description->>'en' LIKE '%moon%' THEN 'انضمي إلى لونا في رحلة سحرية عبر سماء الليل، حيث تلتقي بالنجوم وتتعلم عن القمر.'
      WHEN description->>'en' LIKE '%bear%' OR description->>'en' LIKE '%winter%' THEN 'اتبعي رحلة دب صغير يستعد لبيات الشتاء والأصدقاء الذين يساعدونه في الطريق.'
      WHEN description->>'en' LIKE '%star%' OR description->>'en' LIKE '%wish%' THEN 'كل نجمة في السماء تحمل أمنية. انضمي إلى ميا وهي تكتشف كيف تتحقق الأمنيات بالصبر واللطف.'
      WHEN description->>'en' LIKE '%light%' OR description->>'en' LIKE '%darkness%' THEN 'قصة عن مصباح ليلي صغير يكتشف أن حتى أصغر ضوء يمكنه طرد أكبر ظلام.'
      WHEN description->>'en' LIKE '%fly%' OR description->>'en' LIKE '%dream%' THEN 'انضمي إلى أمير وهو يتعلم الطيران في أحلامه ويكتشف أن الشجاعة يمكن أن تساعدنا على الوصول لآفاق جديدة.'
      ELSE 'قصة جميلة ومثيرة للأطفال'
    END,
    'ar-fos7a', CASE 
      WHEN description->>'en' LIKE '%Luna%' OR description->>'en' LIKE '%moon%' THEN 'انضموا إلى لونا في رحلة سحرية عبر سماء الليل، حيث تلتقي بالنجوم وتتعلم عن القمر.'
      WHEN description->>'en' LIKE '%bear%' OR description->>'en' LIKE '%winter%' THEN 'اتبعوا رحلة دب صغير يستعد لبيات الشتاء والأصدقاء الذين يساعدونه في الطريق.'
      WHEN description->>'en' LIKE '%star%' OR description->>'en' LIKE '%wish%' THEN 'كل نجمة في السماء تحمل أمنية. انضموا إلى ميا وهي تكتشف كيف تتحقق الأمنيات بالصبر واللطف.'
      WHEN description->>'en' LIKE '%light%' OR description->>'en' LIKE '%darkness%' THEN 'حكاية عن مصباح ليلي صغير يكتشف أن حتى أصغر ضوء يمكنه طرد أكبر ظلام.'
      WHEN description->>'en' LIKE '%fly%' OR description->>'en' LIKE '%dream%' THEN 'انضموا إلى أمير وهو يتعلم الطيران في أحلامه ويكتشف أن الشجاعة يمكن أن تساعدنا على الوصول لآفاق جديدة.'
      ELSE 'حكاية رائعة ومشوقة للأطفال'
    END
  ),
  languages = ARRAY['en', 'ar-eg', 'ar-fos7a']
WHERE is_published = true;

-- For any stories that might not have been caught by the pattern matching above,
-- let's add generic Arabic translations
UPDATE public.stories 
SET 
  title = jsonb_build_object(
    'en', COALESCE(title->>'en', title::text),
    'ar-eg', 'قصة رائعة',
    'ar-fos7a', 'حكاية جميلة'
  ),
  description = jsonb_build_object(
    'en', COALESCE(description->>'en', description::text),
    'ar-eg', 'قصة جميلة ومسلية للأطفال قبل النوم',
    'ar-fos7a', 'حكاية رائعة ومفيدة للأطفال قبل النوم'
  ),
  languages = ARRAY['en', 'ar-eg', 'ar-fos7a']
WHERE is_published = true 
  AND (title->'ar-eg' IS NULL OR description->'ar-eg' IS NULL);
