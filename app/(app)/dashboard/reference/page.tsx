import GroupPage from "../[group]/page";

export default function ReferenceGroupPage() {
  return <GroupPage params={Promise.resolve({ group: "reference" })} />;
}
