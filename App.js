import React, { useRef, useState } from "react";
import {
  View,
  ToastAndroid,
  Image,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, { Line, Circle } from "react-native-svg";

export default function App() {
  const viewShotRef = useRef(null);
  const pathRef = useRef([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [, setRender] = useState(); // Dummy state for re-rendering
  const [currentColor, setCurrentColor] = useState("black");
  const colorPalette = ["red", "blue", "green", "yellow", "purple", "pink", "orange"];

  const handlePanGesture = ({ nativeEvent }) => {
    const { state, absoluteX, absoluteY } = nativeEvent;

    if (state === State.ACTIVE) {
      updatePath(absoluteX, absoluteY);
    } else if (state === State.END) {
      captureAndNotify();
    }
  };

  const selectColor = (color) => {
    setCurrentColor(color);
  };

  const updatePath = (x, y) => {
    pathRef.current.push({ x, y, color: currentColor });
    setRender((prev) => !prev);
  };

  const captureDrawing = async () => {
    try {
      const result = await viewShotRef.current.capture();
      console.log("Drawing captured:", result);
      setCapturedImage(result);
    } catch (error) {
      console.error("Error capturing drawing:", error);
    }
  };

  const clearDrawing = () => {
    // Clear the drawing path
    pathRef.current = [];
    setCapturedImage(null); // Clear the captured image
    setRender((prev) => !prev);
  };

  const analyzeIfCircle = () => {
      if (pathRef.current.length < 3) return false;

    const startPoint = pathRef.current[0];
    const endPoint = pathRef.current[pathRef.current.length - 1];
    const distance = Math.sqrt(
      Math.pow(endPoint.x - startPoint.x, 2) +
        Math.pow(endPoint.y - startPoint.y, 2)
    );

    const threshold = 20; // Adjust the threshold as needed
    return distance < threshold;
  };

  const captureAndNotify = async () => {
    await captureDrawing();

    if (analyzeIfCircle()) {
      ToastAndroid.show("Screenshot captured!", ToastAndroid.SHORT);
    } else {
      ToastAndroid.show("Drawing is not a circle.", ToastAndroid.SHORT);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {capturedImage ? (
          <>
            <Image source={{ uri: capturedImage }} style={styles.image} />
            <Button title="Clear" onPress={clearDrawing}/>
          </>
        ) : (
          <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
            <PanGestureHandler
              onGestureEvent={handlePanGesture}
              onHandlerStateChange={handlePanGesture}
            >
              <View style={styles.containers}>
                <Svg height={500} width={500} backgroundColor="transparent">
                  {pathRef.current.map(
                    (point, index) =>
                      index > 0 && (
                        <Line
                          key={index}
                          x1={pathRef.current[index - 1].x}
                          y1={pathRef.current[index - 1].y}
                          x2={point.x}
                          y2={point.y}
                          stroke={point.color}
                          strokeWidth={5}
                        />
                      )
                  )}
                  {/* Render a circle using the first and last point to check if it resembles a circle */}
                  {pathRef.current.length > 2 && (
                    <Circle
                      cx={pathRef.current[0].x}
                      cy={pathRef.current[0].y}
                      r={20} // Adjust the radius as needed
                      fill="transparent"
                      stroke="black"
                      strokeWidth={2}
                    />
                  )}
                </Svg>
              </View>
            </PanGestureHandler>
            {!capturedImage && (
              <View style={styles.colorPalette}>
                {colorPalette.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      color === currentColor && styles.selectedColor,
                    ]}
                    onPress={() => selectColor(color)}
                  />
                ))}
              </View>
            )}
          </ViewShot>
        )}
      </View>
    </GestureHandlerRootView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  containers: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 2, // Set the border width as needed
    borderColor: "black",
    margin: 20,
    padding: 10,
  },
  colorPalette: {
    flexDirection: "row",
    marginTop: 10,
   justifyContent:"center"
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "white",
    marginRight: 10, // Adjust the margin between color buttons
    marginBottom: 10, // Adjust the margin between rows
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "black",
  },
});
