 import logo from './logo.svg';
import './App.css';
 import {fabric} from 'fabric'
 import {useEffect,useState,useRef} from "react";
 require("./canvas/customFabric/LineArrow")

 function App() {
     const [canvas,setCanvas] = useState(null)
     useEffect(() => {
         setCanvas(new fabric.Canvas('canvas'));
     },[])
     const drawCanvas=function(){
        var rect= new fabric.Rect({
            top : 100,
            left : 100,
            width:60,
            height:100,
            fill:'red'
        });
        canvas.add(rect);
        canvas.renderAll();
    }
    const addAnnotationToCanvas=function(canvas,type) {
        let options = {
            custom: {
                arrowA: {
                    type: type || "arrow",
                },
                arrowB: {
                    type: type || "arrow",
                },
                arrowColor: {
                    color: "#ACACAC",
                },
            },
        }
        let coords = [10, 10, 200, 200]
        let arrow1 = true
        if (!options.custom.arrowA.type || !type) arrow1 = false
        let props = {
            canvas,
            objectName: "Line Arrow",
            objectId: options.objectId,
            strokeWidth: 12,
            // stroke: 'rgb(0,0,0)',
            stroke: options.custom.arrowColor.color,
            perPixelTargetFind: true,
            strokeLineCap: "round",
            arrow2: false,
            arrow1: arrow1,
            custom: {
                type: "arrow",
                locked: false,
                arrowA: {
                    type: options.custom.arrowA.type, // arrow , circle , arc
                    arrowSize: 20,
                    arcFill: "transparent",
                    color: "#ACACAC",
                },
                arrowB: {
                    type: options.custom.arrowB.type, // arrow , circle
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
        let newAnnotate = new fabric.LineAnnotateArrow(coords, {...props})
        newAnnotate.set({...props})

        const vpt = canvas.viewportTransform.slice(0)
        const zoom = canvas.getZoom()
        newAnnotate.set({
            left: (-vpt[4] + canvas.width / 2) / zoom,
            top: (-vpt[5] + canvas.height / 2) / zoom,
        })

        canvas.add(newAnnotate)
        canvas.setActiveObject(newAnnotate)
    }


  return (

        <div className={"container mt-10 "} >
          <div className={"row"}>
              <div className={"col-md-8"}>
                  <canvas id="canvas" className={"border 3px solid visible"} width={600} height={900} ></canvas>
              </div>
              <div className={"col-md-4 d-flex align-items-center justify-content-center"}>
                  <button className={"btn-primary"} onClick={drawCanvas}>Draw Rectangle</button>
                  <button className={"ml-5 btn-primary"} onClick={()=> addAnnotationToCanvas(canvas,'arrow')}>Draw Arrow</button>
              </div>
          </div>
        </div>
  );
}

export default App;
