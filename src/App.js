 import logo from './logo.svg';
import './App.css';
 import {fabric} from 'fabric'
 import {useEffect,useState} from "react";
 require("./canvas/customFabric/LineArrow")

 function App() {
     const [canvas,setCanvas]=useState({})
    //  const drawCanvas=function(){
    //      console.log(canvas);
    //     var rect= new fabric.Rect({
    //         top : 100,
    //         left : 100,
    //         width:60,
    //         height:100,
    //         fill:'red'
    //     });
    //     canvas.add(rect);
    //
    // }
     useEffect(()=>{
         setCanvas(new fabric.Canvas('canvas'))
     },[])
     let coords = [10, 10, 200, 200]
     let props = {
         canvas:canvas,
         objectName: "Line Arrow",
         objectId: '',
         strokeWidth: 12,
         // stroke: 'rgb(0,0,0)',
         stroke: '#ACACAC',
         perPixelTargetFind: true,
         strokeLineCap: "round",
         arrow2: false,
         arrow1: true,
         fill:"#FF0000",
         custom: {
             type: "arrow",
             locked: false,
             arrowA: {
                 type: 'arrow', // arrow , circle , arc
                 arrowSize: 20,
                 arcFill: "transparent",
                 color: "#ACACAC",
             },
             arrowB: {
                 type: 'circle', // arrow , circle
                 arrowSize: 20,
                 arcFill: "transparent",
                 color: "#ACACAC",
             },
             transformMatrix: [
                 0.9996190815146402, 0.02759876576637272, -0.02759876576637272,
                 0.9996190815146402, 1084.5, 134,
             ],
         },
         arrowSize: 38,
     }
    const drawAnnotateArrow= function (){
        var arrow= new fabric.LineAnnotateArrow({ ...props });
        canvas.add(arrow);
        canvas.requestRenderAll();
    }


  return (

        <div className={"container mt-10 "} >
          <div className={"row"}>
              <div className={"col-md-8"}>
                  <canvas className={"border 3px solid "} id={"canvas"} width={"600"} height={"600"}></canvas>
              </div>
              <div className={"col-md-4 d-flex align-items-center justify-content-center"}>
                  {/*<button className={"btn-primary"} onClick={()=>*/}
                  {/*    drawCanvas()*/}
                  {/*}>Draw Rectangle</button>*/}
                  <button className={"ml-5 btn-primary"} onClick={()=>
                      drawAnnotateArrow()
                  }>Draw Arrow</button>
              </div>
          </div>
        </div>
  );
}

export default App;
