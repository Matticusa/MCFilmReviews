import { useEffect, useState } from "react";

export function Image( props ) {
    const [img, setImg] = useState()
    if( img ) {
        return(
            <p>Loading....</p>
        )
    }
    else {
        return(
            <img src={img} />
        )
    }
}