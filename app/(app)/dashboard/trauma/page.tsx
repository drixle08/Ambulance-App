import GroupPage from "../[group]/page";

export default function TraumaPage() {
  return <GroupPage params={Promise.resolve({ group: "trauma" })} />;
}
