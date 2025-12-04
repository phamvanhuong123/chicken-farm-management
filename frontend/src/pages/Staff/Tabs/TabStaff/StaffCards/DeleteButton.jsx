import { Trash2 } from "lucide-react"

function DeleteButton () {
    return <>
  <button className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-[7px] ">
                <Trash2 size={18}/>
              </button>
    </>
}

export default DeleteButton