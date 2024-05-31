import React, { useEffect, useRef, useState } from "react";
import Quagga from "@ericblade/quagga2";
import { Box } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import theme from "../../styles/theme";
interface Props {
    onDetected?: (result?: any, cb?: any) => any;
    onDetectedForShipping?: (result?: any, cb?: any) => any;
    stop?: boolean;
    isScan: string;
}

function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/

    const [windowSize, setWindowSize] = useState<any>({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {
            // Set window width/height to state
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        // Add event listener
        window.addEventListener("resize", handleResize);
        // Call handler right away so state gets updated with initial window size
        handleResize();
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize || 10;
}

const Scanner = (props: Props) => {
    let [value, setValue] = useState("no");
    let matches = useMediaQuery(theme.breakpoints.up("sm"));
    const size = useWindowSize();
    const ref: any = useRef(null);

    console.log("🚀 ~ file: Scanner.tsx ~ line 45 ~ Scanner ~ size.width", matches);

    useEffect(() => {
        // closeScanner();
        console.log("width", ref?.current?.offsetWidth);
        console.log("🚀 ~ file: Scanner.tsx ~ line 45 ~ Scanner ~ size.width", size.width);
        Quagga.init(
            {
                numOfWorkers: 4,
                frequency: 10,
                locate: true,
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector("#camera") as any,
                    constraints: {
                        // width: matches ? 600 : size.width ? size.width : window.innerWidth,
                        width: ref?.current?.offsetWidth,
                        height: 300,
                        // width: { min: 320, max: 900 },
                        // height: { min: 200, max: 200 },
                        facingMode: "environment", // or user
                        frameRate: 10,
                    },
                },
                decoder: {
                    readers: [
                        "code_128_reader",
                        // "code_39_reader",
                        // "code_93_reader",
                        // "ean_reader",
                        // "ean_8_reader",
                        // "code_39_reader",
                    ],
                    // code_128_reader (default)
                    // ean_reader
                    // ean_8_reader
                    // code_39_reader
                    // code_39_vin_reader
                    // codabar_reader
                    // upc_reader
                    // upc_e_reader
                    // i2of5_reader
                    // 2of5_reader
                },
                locator: {
                    patchSize: "medium", // x-small, small, medium, large, x-large
                },
            },
            function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                Quagga.start();
                console.log("Initialization finished. Ready to start");
            }
        );

        Quagga.onProcessed(function (result) {
            var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(
                        0,
                        0,
                        parseInt(drawingCanvas.getAttribute("width") as any),
                        parseInt(drawingCanvas.getAttribute("height") as any)
                    );
                    result.boxes
                        .filter(function (box) {
                            return box !== result.box;
                        })
                        .forEach(function (box) {
                            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                                color: "green",
                                lineWidth: 2,
                            });
                        });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
                        color: "#00F",
                        lineWidth: 2,
                    });
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, { x: "x", y: "y" }, drawingCtx, {
                        color: "red",
                        lineWidth: 3,
                    });
                }
            }
        });

        Quagga.onDetected(function (result) {
            var isbn: any = result.codeResult.code;
            if (isbn.match(/^(qaf)-\w+/g)) {
                if (props.isScan == "SEARCH_SCAN") {
                    typeof props.onDetected == "function" && props.onDetected(isbn, closeScanner);
                }
                // console.log("🚀 ~ file: Scanner.tsx ~ line 148 ~ isbn", isbn);
                if (props.isScan == "SHIPPING_SCAN") {
                    // console.log("🚀 ~ file: Scanner.tsx ~ line 148 ~ isbn", isbn);
                    typeof props.onDetectedForShipping == "function" &&
                    props.onDetectedForShipping(isbn, closeScanner);
                }
            }
            closeScanner();
            // if (isbn.match(/^97[8|9]/)) {
            //   var style =
            //     window.innerHeight > window.innerWidth
            //       ? "width: " + window.innerWidth + "px;"
            //       : "height: " + window.innerHeight + "px;";
            //   (document.getElementById("camera") as any).innerHTML =
            //     '<img src="https://cover.openbd.jp/' + isbn + '.jpg" alt="" style="' + style + '">';
            //   var params: any = getQueryString();
            //   if (params) {
            //     var url = params.url + "?" + params.param + "=" + isbn;
            //     setTimeout(function () {
            //       location.href = url;
            //     }, 300);
            //   } else {
            //     alert(isbn);
            //   }
            // }
        });

        function getQueryString() {
            if (location.search === "") return null;
            var params = {};
            location.search
                .substr(1)
                .split("&")
                .map(function (param) {
                    var pairs: any = param.split("=");
                    // @ts-ignore
                    params[pairs[0]] = decodeURIComponent(pairs[1]);
                });
            return params;
        }

        return () => {
            closeScanner();
        };
    }, []);

    const closeScanner = () => {
        Quagga.offProcessed();
        Quagga.offDetected();
        Quagga.stop();
    };

    return (
        <>
            <Box
                ref={ref}
                sx={{
                    "& .drawingBuffer": {
                        position: "absolute",
                        zIndex: 1000,
                        left: 0,
                        // width: "100%",
                    },
                    "& video": {
                        // objectFit: "cover",
                        width: "100%",
                    },
                }}
                width="100%"
                id="camera"
            ></Box>
        </>
    );
};

export default Scanner;
