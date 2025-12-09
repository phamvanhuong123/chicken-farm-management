import ItemJob from "./ItemJob/ItemJob"

function ListJob() {
    const fakeData = [
        {
            nameArea : "Khu A",
            title : ""
            
        },
        {
            nameArea : "Khu B",
            
        },
        {
            nameArea : "Khu C",
            
        },
        {
            nameArea : "Khu D",
            
        }
    ]


    return <div className="">
     {[...Array(4)].map(() => <ItemJob/>)}
     
    </div>
}
export default ListJob