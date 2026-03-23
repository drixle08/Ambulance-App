import GroupPage from "../[group]/page";

export default function RespiratoryAirwayPage() {
  return <GroupPage params={Promise.resolve({ group: "respiratory-airway" })} />;
}
