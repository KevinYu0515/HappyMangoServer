app.get("/get_product", async (req, res) => {
  try {
    const product = await db.query_product();

    for (let i = 0; i < product.length; i++) {
      if (product[i].imgKey == "")
        product[i].img = await getImageFromS3({ key: "default.jpg" });
      else if (
        [".jpeg", ".jpg", ".png", ".gif"].some((extension) =>
          product[i].imgKey.includes(extension),
        )
      ) {
        const suffixIndex = product[i].imgKey.lastIndexOf(".");
        product[i].img = await getImageFromS3({
          key: product[i].imgKey.substring(0, suffixIndex),
        });
      } else {
        product[i].img = await getImageFromS3({ key: product[i].imgKey });
      }
    }

    res.json(product);
  } catch (err) {
    console.error(err);
  }
});
