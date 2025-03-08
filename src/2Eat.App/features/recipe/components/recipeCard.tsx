import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useEffect, useState } from "react";
import { fetchRecipes } from "../services/api";
import { Recipe } from "../models/recipe";
import { ThemedText } from "@/components/ThemedText";

type Props = {};

const RecipeCard = (props: Props) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const data = await fetchRecipes();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    getRecipes();
  }, []);

  return (
    <View>
      <ThemedText type="title">recipeCard</ThemedText>
      {recipes && (
        <FlatList
          data={recipes}
          renderItem={({ item }) => (
            <ThemedText type="subtitle">{item.name}</ThemedText>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

export default RecipeCard;

const styles = StyleSheet.create({});
