-- Create trigger to automatically update course total_duration when lessons are added/updated/deleted
CREATE TRIGGER trigger_update_course_duration
AFTER INSERT OR UPDATE OF duration OR DELETE ON public.course_lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_course_duration();