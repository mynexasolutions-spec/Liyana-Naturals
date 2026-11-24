import { ModuleTable } from "@/components/admin/ModuleTable";
export default function ReviewsPage() {
  return <ModuleTable table="reviews" title="Reviews" searchKeys={["author_name","title","body","status"]} columns={[
    {key:"author_name",label:"Customer"}, {key:"rating",label:"Rating"}, {key:"status",label:"Status"}, {key:"body",label:"Review"}
  ]} emptyFields={[{key:"product_id",label:"Product",type:"select",relation:{table:"products",labelKey:"name"}},{key:"author_name",label:"Author name",required:true},{key:"rating",label:"Rating",type:"number",required:true},{key:"title",label:"Title"},{key:"body",label:"Review",type:"textarea"},{key:"status",label:"Status",type:"select",required:true,options:[{label:"Pending",value:"pending"},{label:"Approved",value:"approved"},{label:"Rejected",value:"rejected"}]}]} />;
}
