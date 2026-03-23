import GroupPage from "../[group]/page";

export default function AssessmentScreeningPage() {
  return <GroupPage params={Promise.resolve({ group: "assessment-screening" })} />;
}
