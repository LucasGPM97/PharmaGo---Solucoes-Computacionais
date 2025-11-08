import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface CarouselProps {
  slides: any[];
  currentSlide: number;
}

const Carousel: React.FC<CarouselProps> = ({ slides, currentSlide }) => {
  return (
    <View style={styles.carouselSection}>
      <View style={styles.carouselContainer}>
        <View style={styles.carouselSlide}>
          <MaterialIcons name="image" size={48} color="#9CA3AF" />
        </View>
      </View>
      <View style={styles.carouselDots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  carouselContainer: {
    height: 192,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselSlide: {
    justifyContent: "center",
    alignItems: "center",
  },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: "#007AFF",
  },
  inactiveDot: {
    backgroundColor: "#D1D5DB",
  },
});

export default Carousel;
