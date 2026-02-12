import "./NavBar.css"

function NavBar ()

{
    return(
        <header>
            <div className="maindiv" style={{display: "flex", justifyContent: "space-between"}}>
                <div>
                <span className="title">StudySync</span>
                </div>

                <div>
                    <span className="rightspan">Built for Students</span>
                    {/* <span>b</span> */}
                    {/* <span>c</span> */}

                </div>

            </div>

        </header>

    )
}

export default NavBar