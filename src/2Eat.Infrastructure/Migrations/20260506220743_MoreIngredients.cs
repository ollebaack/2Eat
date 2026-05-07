using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace _2Eat.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MoreIngredients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 7, 43, 361, DateTimeKind.Unspecified).AddTicks(7096), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 7, 43, 361, DateTimeKind.Unspecified).AddTicks(8901), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 7, 43, 361, DateTimeKind.Unspecified).AddTicks(8919), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 7, 0, 7, 43, 361, DateTimeKind.Unspecified).AddTicks(8923), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 6, "Grönsaker" },
                    { 7, "Frukt & Bär" },
                    { 8, "Mejeri" },
                    { 9, "Spannmål & Bröd" },
                    { 10, "Kryddor & Örter" },
                    { 11, "Nötter & Frön" },
                    { 12, "Olja & Fett" }
                });

            // Reclassify existing ingredients from "Övrigt" to proper categories
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 2,  column: "CategoryId", value: 1);  // Strösocker -> Bakverk
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 3,  column: "CategoryId", value: 8);  // Ägg -> Mejeri
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 4,  column: "CategoryId", value: 8);  // Smör -> Mejeri
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 5,  column: "CategoryId", value: 8);  // Mjölk -> Mejeri
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 6,  column: "CategoryId", value: 8);  // Grädde -> Mejeri
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 7,  column: "CategoryId", value: 6);  // Potatis -> Grönsaker
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 9,  column: "CategoryId", value: 10); // Dill -> Kryddor & Örter
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 11, column: "CategoryId", value: 6);  // Rödbetor -> Grönsaker
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 13, column: "CategoryId", value: 9);  // Kavring -> Spannmål & Bröd
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 14, column: "CategoryId", value: 8);  // Västerbottensost -> Mejeri
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 16, column: "CategoryId", value: 7);  // Lingon -> Frukt & Bär

            migrationBuilder.InsertData(
                table: "Ingredients",
                columns: new[] { "Id", "CategoryId", "Name" },
                values: new object[,]
                {
                    // Grönsaker (6)
                    { 21,  6,  "Lök" },
                    { 22,  6,  "Vitlök" },
                    { 23,  6,  "Morot" },
                    { 24,  6,  "Broccoli" },
                    { 25,  6,  "Blomkål" },
                    { 26,  6,  "Spenat" },
                    { 27,  6,  "Tomat" },
                    { 28,  6,  "Gurka" },
                    { 29,  6,  "Paprika" },
                    { 30,  6,  "Zucchini" },
                    { 31,  6,  "Purjolök" },
                    { 32,  6,  "Selleri" },
                    { 33,  6,  "Vitkål" },
                    { 34,  6,  "Rödkål" },
                    { 35,  6,  "Sötpotatis" },
                    { 36,  6,  "Palsternacka" },
                    { 37,  6,  "Sparris" },
                    { 38,  6,  "Ärtor" },
                    { 39,  6,  "Majs" },
                    { 40,  6,  "Champinjoner" },
                    { 41,  6,  "Kantareller" },
                    { 42,  6,  "Kronärtskocka" },
                    // Frukt & Bär (7)
                    { 43,  7,  "Äpple" },
                    { 44,  7,  "Päron" },
                    { 45,  7,  "Banan" },
                    { 46,  7,  "Citron" },
                    { 47,  7,  "Lime" },
                    { 48,  7,  "Apelsin" },
                    { 49,  7,  "Jordgubbar" },
                    { 50,  7,  "Blåbär" },
                    { 51,  7,  "Hallon" },
                    { 52,  7,  "Körsbär" },
                    { 53,  7,  "Vindruvor" },
                    { 54,  7,  "Mango" },
                    { 55,  7,  "Ananas" },
                    // Mejeri (8)
                    { 56,  8,  "Gräddfil" },
                    { 57,  8,  "Yoghurt" },
                    { 58,  8,  "Crème Fraiche" },
                    { 59,  8,  "Kvarg" },
                    { 60,  8,  "Cheddar" },
                    { 61,  8,  "Parmesanost" },
                    { 62,  8,  "Mozzarella" },
                    { 63,  8,  "Brie" },
                    { 64,  8,  "Cottage Cheese" },
                    { 65,  8,  "Kesella" },
                    // Spannmål & Bröd (9)
                    { 66,  9,  "Ris" },
                    { 67,  9,  "Pasta" },
                    { 68,  9,  "Havregryn" },
                    { 69,  9,  "Bulgur" },
                    { 70,  9,  "Couscous" },
                    { 71,  9,  "Quinoa" },
                    { 72,  9,  "Rågmjöl" },
                    { 73,  9,  "Majsstärkelse" },
                    { 74,  9,  "Jäst" },
                    { 75,  9,  "Bakpulver" },
                    { 76,  9,  "Fullkornsmjöl" },
                    // Kryddor & Örter (10)
                    { 77,  10, "Salt" },
                    { 78,  10, "Svartpeppar" },
                    { 79,  10, "Vitpeppar" },
                    { 80,  10, "Paprikapulver" },
                    { 81,  10, "Gurkmeja" },
                    { 82,  10, "Spiskummin" },
                    { 83,  10, "Timjan" },
                    { 84,  10, "Rosmarin" },
                    { 85,  10, "Basilika" },
                    { 86,  10, "Oregano" },
                    { 87,  10, "Persilja" },
                    { 88,  10, "Gräslök" },
                    { 89,  10, "Mynta" },
                    { 90,  10, "Ingefära" },
                    { 91,  10, "Chili" },
                    { 92,  10, "Lagerblad" },
                    { 93,  10, "Muskotnöt" },
                    { 94,  10, "Vanilj" },
                    // Nötter & Frön (11)
                    { 95,  11, "Valnötter" },
                    { 96,  11, "Mandlar" },
                    { 97,  11, "Cashewnötter" },
                    { 98,  11, "Pistaschnötter" },
                    { 99,  11, "Jordnötter" },
                    { 100, 11, "Hasselnötter" },
                    { 101, 11, "Pinjenötter" },
                    { 102, 11, "Sesamfrön" },
                    { 103, 11, "Solrosfrön" },
                    { 104, 11, "Pumpafrön" },
                    // Olja & Fett (12)
                    { 105, 12, "Olivolja" },
                    { 106, 12, "Rapsolja" },
                    { 107, 12, "Solrosolja" },
                    { 108, 12, "Kokosolja" },
                    { 109, 12, "Margarin" },
                    // Kött (3)
                    { 110, 3,  "Nötkött" },
                    { 111, 3,  "Fläskkött" },
                    { 112, 3,  "Kyckling" },
                    { 113, 3,  "Lamm" },
                    { 114, 3,  "Kalvkött" },
                    { 115, 3,  "Bacon" },
                    { 116, 3,  "Korv" },
                    { 117, 3,  "Köttfärs" },
                    { 118, 3,  "Kycklingfilé" },
                    { 119, 3,  "Fläskfilé" },
                    // Fisk (4)
                    { 120, 4,  "Torsk" },
                    { 121, 4,  "Sill" },
                    { 122, 4,  "Makrill" },
                    { 123, 4,  "Tonfisk" },
                    { 124, 4,  "Röding" },
                    { 125, 4,  "Abborre" },
                    { 126, 4,  "Hummer" },
                    { 127, 4,  "Blåmusslor" },
                    { 128, 4,  "Krabba" },
                    // Övrigt (5)
                    { 129, 5,  "Soja" },
                    { 130, 5,  "Worcestershiresås" },
                    { 131, 5,  "Ketchup" },
                    { 132, 5,  "Senap" },
                    { 133, 5,  "Majonnäs" },
                    { 134, 5,  "Honung" },
                    { 135, 5,  "Ljus Sirap" },
                    { 136, 5,  "Ättika" },
                    { 137, 5,  "Rödvinsvinäger" },
                    { 138, 5,  "Balsamvinäger" },
                    { 139, 5,  "Buljong" },
                    { 140, 5,  "Kokosmjölk" },
                    { 141, 5,  "Tomatpuré" },
                    { 142, 5,  "Krossade Tomater" },
                    { 143, 5,  "Kikärtor" },
                    { 144, 5,  "Linser" },
                    { 145, 5,  "Bönor" }
                });

            migrationBuilder.InsertData(
                table: "AllergenIngredient",
                columns: new[] { "AllergensId", "IngredientsId" },
                values: new object[,]
                {
                    // Lactose — existing ingredients now in Mejeri
                    { 3, 4 },   // Smör
                    { 3, 5 },   // Mjölk
                    { 3, 6 },   // Grädde
                    { 3, 14 },  // Västerbottensost
                    // Gluten — existing
                    { 0, 13 },  // Kavring
                    // Gluten — new grain ingredients
                    { 0, 67 },  // Pasta
                    { 0, 68 },  // Havregryn
                    { 0, 72 },  // Rågmjöl
                    { 0, 76 },  // Fullkornsmjöl
                    // Lactose — new dairy ingredients
                    { 3, 56 },  // Gräddfil
                    { 3, 57 },  // Yoghurt
                    { 3, 58 },  // Crème Fraiche
                    { 3, 59 },  // Kvarg
                    { 3, 60 },  // Cheddar
                    { 3, 61 },  // Parmesanost
                    { 3, 62 },  // Mozzarella
                    { 3, 63 },  // Brie
                    { 3, 64 },  // Cottage Cheese
                    { 3, 65 },  // Kesella
                    // Nuts — all nut/seed ingredients
                    { 4, 95 },  // Valnötter
                    { 4, 96 },  // Mandlar
                    { 4, 97 },  // Cashewnötter
                    { 4, 98 },  // Pistaschnötter
                    { 4, 99 },  // Jordnötter
                    { 4, 100 }, // Hasselnötter
                    { 4, 101 }, // Pinjenötter
                    { 4, 102 }  // Sesamfrön
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AllergenIngredient",
                keyColumns: new[] { "AllergensId", "IngredientsId" },
                keyValues: new object[,]
                {
                    { 3, 4 },
                    { 3, 5 },
                    { 3, 6 },
                    { 3, 14 },
                    { 0, 13 },
                    { 0, 67 },
                    { 0, 68 },
                    { 0, 72 },
                    { 0, 76 },
                    { 3, 56 },
                    { 3, 57 },
                    { 3, 58 },
                    { 3, 59 },
                    { 3, 60 },
                    { 3, 61 },
                    { 3, 62 },
                    { 3, 63 },
                    { 3, 64 },
                    { 3, 65 },
                    { 4, 95 },
                    { 4, 96 },
                    { 4, 97 },
                    { 4, 98 },
                    { 4, 99 },
                    { 4, 100 },
                    { 4, 101 },
                    { 4, 102 }
                });

            migrationBuilder.DeleteData(
                table: "Ingredients",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
                    41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
                    51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
                    61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
                    71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
                    81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
                    91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
                    101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
                    111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
                    121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
                    131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
                    141, 142, 143, 144, 145
                });

            // Revert category reclassifications
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 2,  column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 3,  column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 4,  column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 5,  column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 6,  column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 7,  column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 9,  column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 11, column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 13, column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 14, column: "CategoryId", value: 5);
            migrationBuilder.UpdateData(table: "Ingredients", keyColumn: "Id", keyValue: 16, column: "CategoryId", value: 5);

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValues: new object[] { 6, 7, 8, 9, 10, 11, 12 });

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(4544), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(6297), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(6302), new TimeSpan(0, 2, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Recipes",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 5, 5, 23, 10, 3, 218, DateTimeKind.Unspecified).AddTicks(6306), new TimeSpan(0, 2, 0, 0, 0)));
        }
    }
}
