import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import RootNavigation from "@/components/Nav/Nav";
import NavigationBar from "@/components/profile/NavigationBar";

const ProjectPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const supabase = useSupabaseClient();
  const [project, setProject] = useState(null);
  const [answersBySection, setAnswersBySection] = useState({});
  const [sectionTitles, setSectionTitles] = useState([]);
  const [currentFormPage, setCurrentFormPage] = useState(0);

  const loadProject = async () => {
    const { data: proj, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("Error fetching project:", error);
      return;
    }
    setProject(proj);
  };

  const loadProjectDescription = async (answersMap) => {
    const qIds = Object.keys(answersMap);
    if (qIds.length === 0) {
      setAnswersBySection({});
      setSectionTitles([]);
      return;
    }

    const { data: questions, error: qErr } = await supabase
      .from("project_questions")
      .select("id, question")
      .in("id", qIds);
    if (qErr) return console.error(qErr);

    const mid = Math.ceil(questions.length / 2);
    const firstChunk = questions.slice(0, mid);
    const secondChunk = questions.slice(mid);

    const buckets = {
      "Part 1": {},
      "Part 2": {},
    };

    firstChunk.forEach(q => {
      buckets["Part 1"][q.question] = answersMap[q.id];
    });
    secondChunk.forEach(q => {
      buckets["Part 2"][q.question] = answersMap[q.id];
    });

    setAnswersBySection(buckets);
    setSectionTitles(["Part 1", "Part 2"]);
  };

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  useEffect(() => {
    if (project?.title) {
      loadProjectDescription(project.description);
    }
  }, [project]);

  if (!project) return <div>Loading…</div>;

  return (
    <div className={"mb-10"}>
      <RootNavigation title={project.title} backBtn/>

      <div className="pt-4 pb-6">
        <img
          src={project.img_url}
          alt="Preview"
          className="mt-2 rounded-md w-full h-auto max-h-[400px] object-contain"
        />
        <NavigationBar/>
      </div>
      <div className={"mb-6"}>
        <h4 className="font-semibold text-lg mb-1">
          Project Description:
        </h4>
        <p>{project.project_description}</p>
      </div>
      <h4 className="font-semibold text-lg mb-2">
        Details:
      </h4>
      <div className="p-3 bg-gray-100 rounded-lg shadow-md mb-4 border border-gray-300">
        {sectionTitles.length > 0 &&
          answersBySection[sectionTitles[currentFormPage]] && (
            <div key={sectionTitles[currentFormPage]} className="mb-6">
              <div>
                {Object.entries(
                  answersBySection[sectionTitles[currentFormPage]]
                ).map(([questionTitle, value]) => (
                  <div
                    key={questionTitle}
                    className="mb-4 pb-4 border-b border-gray-300 last:border-0 last:mb-0 last:pb-0"
                  >
                    <p className="mb-2">
                      <b>{questionTitle}:</b>
                    </p>
                    <span className="text-gray-700">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

      </div>
      {sectionTitles.length > 0 && (
        <div className="flex items-center justify-between mb-4 overflow-x-auto gap-2 pb-4 -mx-6 px-8">
          {sectionTitles.map((_, idx) => (
            <span
              key={idx}
              className={`${
                currentFormPage === idx ? "bg-green-800" : "bg-gray-300"
              } min-w-8 shrink-0 grow h-1 cursor-pointer rounded-full`}
              onClick={() => setCurrentFormPage(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
