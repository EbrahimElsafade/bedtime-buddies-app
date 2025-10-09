-- Fix search_path for new validation functions
DROP FUNCTION IF EXISTS validate_course_learning_objectives() CASCADE;
DROP FUNCTION IF EXISTS validate_course_instructor() CASCADE;

CREATE OR REPLACE FUNCTION validate_course_learning_objectives()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.learning_objectives_en IS NULL OR array_length(NEW.learning_objectives_en, 1) IS NULL)
     AND (NEW.learning_objectives_ar IS NULL OR array_length(NEW.learning_objectives_ar, 1) IS NULL)
     AND (NEW.learning_objectives_fr IS NULL OR array_length(NEW.learning_objectives_fr, 1) IS NULL) THEN
    RAISE EXCEPTION 'At least one language must have learning objectives defined';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_learning_objectives_before_insert_update
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION validate_course_learning_objectives();

CREATE OR REPLACE FUNCTION validate_course_instructor()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.instructor_name_en IS NOT NULL 
      OR NEW.instructor_name_ar IS NOT NULL 
      OR NEW.instructor_name_fr IS NOT NULL
      OR NEW.instructor_bio_en IS NOT NULL
      OR NEW.instructor_bio_ar IS NOT NULL
      OR NEW.instructor_bio_fr IS NOT NULL
      OR NEW.instructor_avatar IS NOT NULL) THEN
    IF (NEW.instructor_name_en IS NULL OR trim(NEW.instructor_name_en) = '')
       AND (NEW.instructor_name_ar IS NULL OR trim(NEW.instructor_name_ar) = '')
       AND (NEW.instructor_name_fr IS NULL OR trim(NEW.instructor_name_fr) = '') THEN
      RAISE EXCEPTION 'If instructor information is provided, at least one language must have instructor name defined';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_instructor_before_insert_update
  BEFORE INSERT OR UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION validate_course_instructor();