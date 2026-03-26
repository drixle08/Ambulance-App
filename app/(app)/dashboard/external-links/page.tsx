import GroupPage from "../[group]/page";

export default function ExternalLinksPage() {
  return <GroupPage params={Promise.resolve({ group: "external-links" })} />;
}
