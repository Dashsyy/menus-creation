// Starter menus. Each is a full menu document in the same shape the editor saves/exports.
window.STARTERS = {
  cafe: {
    business: {
      name: "Corner Bean Café",
      tagline: "Fresh coffee & homemade pastries",
      logo: "",
      address: "12 Market Street",
      contact: "(555) 123-4567 · cornerbean.example"
    },
    design: { template: "chalk", accent: "#f4c95d", currency: "$", columns: "2", paper: "letter" },
    promos: [
      { title: "Happy Hour", detail: "20% off all iced drinks, 2–4pm weekdays", image: "images/samples/iced-latte.svg" },
      { title: "Loyalty card", detail: "Buy 9 coffees, the 10th is free" }
    ],
    sections: [
      {
        title: "Coffee",
        items: [
          { name: "Espresso", desc: "Double shot, house blend", price: "2.80", tags: "", image: "images/samples/espresso.svg" },
          { name: "Flat White", desc: "Velvety microfoam", price: "3.90", tags: "popular", image: "images/samples/coffee.svg" },
          { name: "Iced Latte", desc: "Oat milk available", price: "4.50", tags: "promo", image: "images/samples/iced-latte.svg" }
        ]
      },
      {
        title: "Bakery",
        items: [
          { name: "Butter Croissant", desc: "Baked every morning", price: "3.20", tags: "veg", image: "images/samples/croissant.svg" },
          { name: "Banana Bread", desc: "With walnuts", price: "3.50", tags: "veg, new", image: "images/samples/banana-bread.svg" }
        ]
      }
    ],
    footer: "Please tell us about any allergies. Free Wi-Fi: CornerBean"
  },

  restaurant: {
    business: {
      name: "Rosa's Kitchen",
      tagline: "Family recipes since 1998",
      logo: "",
      address: "48 Harbor Road",
      contact: "Reservations (555) 987-6543"
    },
    design: { template: "classic", accent: "#9b2c2c", currency: "$", columns: "1", paper: "letter" },
    promos: [
      { title: "Family Combo", detail: "2 mains + 2 kids meals + dessert to share for $49", image: "images/samples/lasagna.svg" }
    ],
    sections: [
      {
        title: "Starters",
        items: [
          { name: "Garlic Bread", desc: "Wood-fired, herb butter", price: "6", tags: "veg", image: "images/samples/garlic-bread.svg" },
          { name: "Calamari", desc: "Lemon aioli", price: "11", tags: "" }
        ]
      },
      {
        title: "Mains",
        items: [
          { name: "Lasagna", desc: "Beef ragù, béchamel, parmesan", price: "18", tags: "popular", image: "images/samples/lasagna.svg" },
          { name: "Penne Arrabbiata", desc: "Tomato, chili, basil", price: "15", tags: "veg, spicy", image: "images/samples/pasta.svg" },
          { name: "Grilled Salmon", desc: "Seasonal greens, lemon butter", price: "24", tags: "gf", image: "images/samples/salmon.svg" }
        ]
      },
      {
        title: "Desserts",
        items: [
          { name: "Tiramisu", desc: "House-made", price: "8", tags: "", image: "images/samples/tiramisu.svg" }
        ]
      }
    ],
    footer: "A 10% service charge applies to tables of 8 or more."
  },

  chain: {
    business: {
      name: "STACK BURGER CO.",
      tagline: "Smashed fresh. Served fast.",
      logo: "",
      address: "25 locations · find yours at stackburger.example",
      contact: "Order online or in the app"
    },
    design: { template: "modern", accent: "#e4572e", currency: "$", columns: "2", paper: "a4" },
    promos: [
      { title: "App exclusive", detail: "Free fries with any burger ordered in the app", image: "images/samples/fries.svg" },
      { title: "Meal deal", detail: "Add fries + drink to any burger for $3.99", image: "images/samples/burger.svg" }
    ],
    sections: [
      {
        title: "Burgers",
        items: [
          { name: "Classic Stack", desc: "Double smash patty, cheese, pickles, stack sauce", price: "9.49", tags: "popular", image: "images/samples/burger.svg" },
          { name: "Spicy Stack", desc: "Jalapeños, pepper jack, chipotle mayo", price: "9.99", tags: "spicy, new", image: "images/samples/burger-spicy.svg" },
          { name: "Garden Stack", desc: "Plant-based patty, lettuce, tomato", price: "9.49", tags: "veg", image: "images/samples/burger-veggie.svg" }
        ]
      },
      {
        title: "Sides",
        items: [
          { name: "Fries", desc: "Sea salt", price: "2.99", tags: "veg, promo", image: "images/samples/fries.svg" },
          { name: "Onion Rings", desc: "Beer battered", price: "3.49", tags: "veg", image: "images/samples/onion-rings.svg" }
        ]
      },
      {
        title: "Drinks",
        items: [
          { name: "Shakes", desc: "Vanilla, chocolate, strawberry", price: "4.49", tags: "", image: "images/samples/shake.svg" },
          { name: "Soft Drinks", desc: "Free refills", price: "1.99", tags: "" }
        ]
      }
    ],
    footer: "Prices may vary by location. Calorie information available on request."
  }
};

// Images can be a web address, a path in this site (images/...) or a photo uploaded in the editor.
// The images/samples/ illustrations are placeholders; replace them with real photos.

// Recognised item tags → label shown on the menu.
window.TAG_LABELS = {
  veg: "Vegetarian",
  vegan: "Vegan",
  gf: "Gluten-free",
  spicy: "Spicy",
  new: "New",
  popular: "Bestseller",
  promo: "On offer"
};
