import { ModuleTable } from "@/components/admin/ModuleTable";
export default function InquiriesPage() {
  return <ModuleTable table="inquiries" title="Inquiries" searchKeys={["name","email","subject","status","message"]} columns={[
    {key:"name",label:"Name"}, {key:"email",label:"Email"}, {key:"subject",label:"Subject"}, {key:"status",label:"Status"}
  ]} emptyFields={[{key:"name",label:"Name",required:true},{key:"email",label:"Email",type:"email",required:true},{key:"phone",label:"Phone"},{key:"subject",label:"Subject"},{key:"message",label:"Message",type:"textarea",required:true},{key:"status",label:"Status",type:"select",required:true,options:[{label:"New",value:"new"},{label:"In progress",value:"in_progress"},{label:"Resolved",value:"resolved"},{label:"Closed",value:"closed"}]}]} />;
}
