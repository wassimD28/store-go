import { appCategoryColumns } from "@/client/components/data-table/colums/category.colums";
import { DataTable} from "@/client/components/data-table/data-table";
import { mockAppCategories } from "@/lib/mock/mock-categoryData";

function Page() {
  return  <div className="w-full h-full p-4">
    <DataTable data={mockAppCategories} columns={appCategoryColumns}/>
  </div>
}

export default Page;