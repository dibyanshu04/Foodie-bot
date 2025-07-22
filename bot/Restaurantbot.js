const {
  ActivityHandler,
  MemoryStorage,
  ConversationState,
  UserState,
  CardFactory,
} = require("botbuilder");
const {
  DialogSet,
  WaterfallDialog,
  TextPrompt,
  ChoicePrompt,
  ChoiceFactory,
  DialogTurnStatus,
  ListStyle,
} = require("botbuilder-dialogs");
const axios = require("axios");

// Dialog IDs
const MAIN_DIALOG = "mainDialog";
const AUTH_DIALOG = "authDialog";
const LOGIN_DIALOG = "loginDialog";
const SIGNUP_DIALOG = "signupDialog";
const ORDER_DIALOG = "orderDialog";
const TRACK_DIALOG = "trackDialog";
const RESERVE_DIALOG = "reserveDialog";
const FIND_REST_DIALOG = "findRestDialog";
const MENU_DIALOG = "menuDialog";
const CART_DIALOG = "cartDialog";
const MANAGE_RES_DIALOG = "manageResDialog";
const FILTER_REST_DIALOG = "filterRestDialog";
const DISCOVERY_DIALOG = "discoveryDialog";
const MANAGE_ORDERS_DIALOG = "manageOrdersDialog";
const MANAGE_SINGLE_ORDER_DIALOG = "manageSingleOrderDialog";

// Prompt IDs
const PROMPT_TEXT = "textPrompt";
const PROMPT_CHOICE = "choicePrompt";
const EMAIL_PROMPT = "emailPrompt";
const PASSWORD_PROMPT = "passwordPrompt";
const FIRSTNAME_PROMPT = "firstNamePrompt";
const LASTNAME_PROMPT = "lastNamePrompt";
const ADDRESS_PROMPT = "addressPrompt";
const PHONE_PROMPT = "phonePrompt";

class RestaurantBot extends ActivityHandler {
  constructor() {
    super();

    // 1. State
    const memoryStorage = new MemoryStorage();
    this.conversationState = new ConversationState(memoryStorage);
    this.userState = new UserState(memoryStorage);

    // 2. Dialogs
    this.dialogState = this.conversationState.createProperty("dialogState");
    this.dialogs = new DialogSet(this.dialogState);

    // 3. Prompts
    this.dialogs.add(new TextPrompt(PROMPT_TEXT));
    this.dialogs.add(new ChoicePrompt(PROMPT_CHOICE));
    this.dialogs.add(new TextPrompt(EMAIL_PROMPT));
    this.dialogs.add(new TextPrompt(PASSWORD_PROMPT));
    this.dialogs.add(new TextPrompt(FIRSTNAME_PROMPT));
    this.dialogs.add(new TextPrompt(LASTNAME_PROMPT));
    this.dialogs.add(new TextPrompt(ADDRESS_PROMPT));
    this.dialogs.add(new TextPrompt(PHONE_PROMPT));

    //load clu model
    //this.recognizer = new LanguageRecognizer();
    // a. Cart state (array of cart items)
    this.cartProperty = this.userState.createProperty("cart");
    // create a userProfile property to store the JWT
    this.userProfile = this.userState.createProperty("userProfile");

    // 4. Main menu
    this.dialogs.add(
      new WaterfallDialog(MAIN_DIALOG, [
        async (step) => {
          const profile = await this.userProfile.get(step.context, {});
          if (profile?.user?.firstName) {
            await step.context.sendActivity(
              `👋 Welcome back, ${profile.user.firstName}!`
            );
          }
          return step.prompt(PROMPT_CHOICE, {
            prompt: "🍽️ What would you like to do?",

            choices: ChoiceFactory.toChoices([
              "Browse Restaurants",
              "Discover Restaurants",
              "View Menu",
              "Place Order",
              "Track Order",
              "Make Reservation",
              "View / Manage Cart",
              "Manage Reservations",
              "Filter Restaurants",
              "Log In",
              "Sign Up",
            ]),
          });
        },
        this.routeFromMainMenu.bind(this),
      ])
    );

    // 5. Auth flow
    this.dialogs.add(
      new WaterfallDialog(AUTH_DIALOG, [
        // Step 1: Prompt with suggested‐action buttons
        async (step) => {
          return step.prompt(PROMPT_CHOICE, {
            prompt: "🔐 You need an account to continue. Choose an option:",
            choices: ChoiceFactory.toChoices(["Log In", "Sign Up", "Cancel"]),
            style: ListStyle.suggestedAction,
          });
        },

        // Step 2: Route based on what they tapped
        async (step) => {
          const choice = step.result.value || step.result;
          if (choice === "Log In") return step.beginDialog(LOGIN_DIALOG);
          if (choice === "Sign Up") return step.beginDialog(SIGNUP_DIALOG);

          // “Cancel” or anything else
          await step.context.sendActivity("🚪 Returning to main menu.");
          return step.endDialog("cancelled");
        },
      ])
    );

    // 6. Login
    this.dialogs.add(
      new WaterfallDialog(LOGIN_DIALOG, [
        async (step) => step.prompt(EMAIL_PROMPT, "Enter your email:"),
        async (step) => {
          step.values.email = step.result;
          return step.prompt(PASSWORD_PROMPT, "Enter your password:");
        },
        async (step) => {
          const { email } = step.values;
          const password = step.result;
          try {
            const resp = await axios.post("http://localhost:5000/user/login", {
              email,
              password,
            });
            const { token, user } = resp.data;
            const profileProp = this.userState.createProperty("userProfile");
            await profileProp.set(step.context, { token, user });
            await this.userState.saveChanges(step.context);

            await step.context.sendActivity("✅ Logged in successfully!");
          } catch (error) {
            const msg = error.response?.data?.message || "Login failed.";
            await step.context.sendActivity(`❌ ${msg}`);
            return step.replaceDialog(LOGIN_DIALOG); // optionally re-ask
          }

          await step.context.sendActivity("Returning to main menu...");
          return step.replaceDialog(MAIN_DIALOG);
        },
      ])
    );

    // 7. Sign Up
    this.dialogs.add(
      new WaterfallDialog(SIGNUP_DIALOG, [
        async (step) => step.prompt(FIRSTNAME_PROMPT, "First name?"),
        async (step) => {
          step.values.firstName = step.result;
          return step.prompt(LASTNAME_PROMPT, "Last name?");
        },
        async (step) => {
          step.values.lastName = step.result;
          return step.prompt(ADDRESS_PROMPT, "Your address?");
        },
        async (step) => {
          step.values.address = step.result;
          return step.prompt(EMAIL_PROMPT, "Email?");
        },
        async (step) => {
          step.values.email = step.result;
          return step.prompt(PHONE_PROMPT, "Phone number?");
        },
        async (step) => {
          step.values.phone = step.result;
          return step.prompt(PASSWORD_PROMPT, "Choose a password:");
        },
        async (step) => {
          const vals = step.values;
          const pwd = step.result;
          try {
            await axios.post("http://localhost:5000/user/signup", {
              firstName: vals.firstName,
              lastName: vals.lastName,
              address: vals.address,
              email: vals.email,
              phone: vals.phone,
              password: pwd,
            });
            // auto-login
            const loginResp = await axios.post(
              "http://localhost:5000/user/login",
              {
                email: vals.email,
                password: pwd,
              }
            );

            const { token, user } = loginResp.data;
            const profileProp = this.userState.createProperty("userProfile");
            await profileProp.set(step.context, { token, user });

            await this.userState.saveChanges(step.context);

            await step.context.sendActivity("🎉 Account created & logged in!");
          } catch (error) {
            const msg = error.response?.data?.message || "Login failed.";
            await step.context.sendActivity(`❌ ${msg}`);
            return step.replaceDialog(SIGNUP_DIALOG); // optionally re-ask
          }

          await step.context.sendActivity("Returning to main menu...");
          return step.replaceDialog(MAIN_DIALOG);
        },
      ])
    );

    // 8. Place Order
    this.dialogs.add(
      new WaterfallDialog(ORDER_DIALOG, [
        // Step 1: Auth guard
        async (step) => {
          const profile = await this.userProfile.get(step.context, {});
          if (!profile.token) {
            // Not logged in → show Login/Sign-Up buttons via AUTH_DIALOG
            return step.beginDialog(AUTH_DIALOG);
          }
          // Already authenticated → move to next step
          return step.next();
        },

        // Step 2: After auth, check cart and prompt for address
        async (step) => {
          // If user canceled login, send them back to main menu
          const profile = await this.userProfile.get(step.context, {});
          if (!profile.token) {
            await step.context.sendActivity("🚪 Returning to main menu.");
            return step.replaceDialog(MAIN_DIALOG);
          }

          // Check if cart has items
          const cart = await this.cartProperty.get(step.context, []);
          if (!cart.length) {
            await step.context.sendActivity(
              "🛒 Your cart is empty. Add items before placing an order."
            );
            return step.endDialog();
          }

          // Good to go → ask for delivery address only
          return step.prompt(
            PROMPT_TEXT,
            "🏠 Please enter your delivery address:"
          );
        },

        // Step 3: Capture, cast to string, save, then call API
        async (step) => {
          // 1) Grab the raw result
          const raw = step.result;

          // 2) Cast/normalize to string
          const address = (raw != null ? raw : "").toString().trim();

          // 3) Save into your waterfall state
          step.values.deliveryAddress = address;
          console.log("✏️ Captured Address (string):", address);

          // 4) Proceed to place the order
          return this._placeOrderAPI(step);
        },
      ])
    );

    // 9. Track Order
    this.dialogs.add(
      new WaterfallDialog(TRACK_DIALOG, [
        async (step) => step.prompt(PROMPT_TEXT, "Enter your Order ID:"),
        this._trackOrderAPI.bind(this),
      ])
    );

    // 10. Make Reservation (auth)
    this.dialogs.add(
      new WaterfallDialog(RESERVE_DIALOG, [
        // Step 1: Auth guard
        async (step) => {
          const profile = await this.userProfile.get(step.context, {});
          if (!profile.token) {
            return step.beginDialog(AUTH_DIALOG);
          }
          return step.next();
        },
        async (step) =>
          step.prompt(
            PROMPT_TEXT,
            "👤 What name should we put on the reservation?"
          ),

        async (step) => {
          // Save customer name
          step.values.customerName = step.result;

          // Fetch available restaurants
          const resp = await axios.get("http://localhost:5000/restaurant");
          const list = resp.data.Restaurant || [];

          // Build ChoicePrompt options
          const choices = list.map((r) => ({
            value: r.restaurantName,
            action: {
              type: "imBack",
              title: r.restaurantName,
              value: r.restaurantName,
            },
          }));

          // Store list for later
          step.values.restaurants = list;

          // Prompt user to pick one
          return step.prompt(PROMPT_CHOICE, {
            prompt: "🏙️ Please select a restaurant:",
            choices: ChoiceFactory.toChoices(list.map((r) => r.restaurantName)),
            style: ListStyle.suggestedAction,
          });
        },
        async (step) => {
          // Extract the selected restaurantName string
          const choice = step.result.value;
          step.values.restaurantName = choice;
          console.log("🏨 Chosen Restaurant:", choice);
          return step.prompt(PROMPT_TEXT, "📅 What date? (YYYY-MM-DD)");
        },
        async (step) => {
          step.values.date = step.result;
          return step.prompt(PROMPT_TEXT, "Time (HH:MM)?");
        },
        async (step) => {
          step.values.time = step.result;
          return step.prompt(PROMPT_TEXT, "Number of guests?");
        },
        this._makeReservationAPI.bind(this),
      ])
    );

    // 11. Browse Restaurants → Pick one
    this.dialogs.add(
      new WaterfallDialog(FIND_REST_DIALOG, [
        // Step A: Show restaurant cards
        async (step) => {
          const resp = await axios.get("http://localhost:5000/restaurant");
          const list = resp.data.Restaurant;
          step.values.restaurants = list;

          const cards = list.map((r) =>
            CardFactory.heroCard(
              r.restaurantName,
              `${r.cuisine.join(", ")} | ${r.location} | ${r.priceRange}`,
              [
                r.imageUrl ||
                  "https://via.placeholder.com/300x200?text=Restaurant",
              ],
              [{ type: "imBack", title: "Select", value: r.restaurantName }]
            )
          );
          await step.context.sendActivity({
            attachments: cards,
            attachmentLayout: "carousel",
          });

          return step.prompt(
            PROMPT_TEXT,
            "Type the restaurant name to view its menu:"
          );
        },

        // Step B: Start MENU_DIALOG passing along the choice
        async (step) => {
          const choice = (step.result || "").toLowerCase();
          const list = step.values.restaurants;
          const selected = list.find(
            (r) => r.restaurantName.toLowerCase() === choice
          );
          if (!selected) {
            await step.context.sendActivity(
              `❌ "${step.result}" not found. Returning to main menu.`
            );
            return step.endDialog();
          }
          // store the selected restaurant so MENU_DIALOG can read it
          step.values.selectedRestaurant = selected;
          return step.beginDialog(MENU_DIALOG, {
            fromDiscovery: true,
            restaurant: selected,
          });
        },
      ])
    );

    // DISCOVERY_DIALOG: Regex‐based free‐form search → carousel → next steps
    this.dialogs.add(
      new WaterfallDialog(DISCOVERY_DIALOG, [
        // Step 1: Prompt for search terms
        async (step) => {
          return step.prompt(
            PROMPT_TEXT,
            "🔍 What restaurants are you looking for? " +
              '(e.g. "Italian in Kharar under 500")'
          );
        },

        // Step 2: Parse + fetch + show carousel
        async (step) => {
          const text = (step.result || "").toLowerCase();
          const cuisineMatch = text.match(
            /italian|chinese|indian|mexican|thai/
          );
          const locationMatch = text.match(/in\s+([a-z\s]+)/);
          const priceMatch = text.match(/under\s+₹?(\d+)/);

          const params = [];
          if (cuisineMatch)
            params.push(`cuisine=${encodeURIComponent(cuisineMatch[0])}`);
          if (locationMatch)
            params.push(
              `location=${encodeURIComponent(locationMatch[1].trim())}`
            );
          if (priceMatch) params.push(`priceRange=₹${priceMatch[1]}`);

          let list = [];
          try {
            const resp = await axios.get(
              `http://localhost:5000/restaurant?${params.join("&")}`
            );
            list = resp.data.Restaurant || [];
          } catch {
            await step.context.sendActivity("⚠️ Could not fetch restaurants.");
            return step.endDialog();
          }

          if (!list.length) {
            await step.context.sendActivity(
              `❌ No restaurants found for “${step.result}.”`
            );
            return step.endDialog();
          }

          step.values.filtered = list;
          const cards = list.map((r) =>
            CardFactory.heroCard(
              r.restaurantName,
              `${r.cuisine.join(", ")} | ${r.location} | ${r.priceRange}`,
              [r.imageUrl || "https://via.placeholder.com/300"],
              [{ type: "imBack", title: "Select", value: r.restaurantName }]
            )
          );
          await step.context.sendActivity({
            attachments: cards,
            attachmentLayout: "carousel",
          });

          const choices = list.map((r) => r.restaurantName);
          return step.prompt(PROMPT_CHOICE, {
            prompt: "Which restaurant would you like to explore?",
            choices: ChoiceFactory.toChoices(choices),
          });
        },

        // Step 3: Offer next actions for the picked restaurant
        async (step) => {
          const name = step.result.value || step.result;
          const rest = step.values.filtered.find(
            (r) => r.restaurantName === name
          );
          step.values.selectedRestaurant = rest;
          return step.prompt(PROMPT_CHOICE, {
            prompt: `What would you like to do next for "${rest.restaurantName}"?`,
            choices: ChoiceFactory.toChoices([
              "View Menu",
              "Make Reservation",
              "Back to Main Menu",
            ]),
          });
        },

        // Step 4: Route to MENU_DIALOG or RESERVE_DIALOG
        async (step) => {
          const action = step.result.value;
          const rest = step.values.selectedRestaurant;
          switch (action) {
            case "View Menu":
              return step.beginDialog(MENU_DIALOG, {
                fromDiscovery: true,
                restaurant: rest,
              });
            case "Make Reservation":
              return step.beginDialog(RESERVE_DIALOG, {
                restaurantName: rest.restaurantName,
              });
            default:
              return step.endDialog();
          }
        },
      ])
    );

    // 12. View Menu (cards with Add to Cart)
    this.dialogs.add(
      new WaterfallDialog(MENU_DIALOG, [
        // Step 1: If we have a restaurant from discovery, show its menu immediately
        async (step) => {
          const opts = step.options || {};
          const r = opts.restaurant;

          if (opts.fromDiscovery && r) {
            // Build menu cards straight away
            const itemCards = r.menu.map((p) => {
              const avg = p.userRating?.length
                ? (
                    p.userRating.reduce((s, r) => s + r.rating, 0) /
                    p.userRating.length
                  ).toFixed(1)
                : "No ratings";
              const subtitle = `₹${p.price} | ${p.foodType} | ⭐${avg}`;

              return CardFactory.heroCard(
                p.productName,
                subtitle + (p.description ? `\n${p.description}` : ""),
                [p.imageUrl || "https://via.placeholder.com/300x200?text=Dish"],
                [
                  {
                    type: "imBack",
                    title: "Add to Cart",
                    value: `addcart ${p._id}`,
                  },
                ]
              );
            });

            await step.context.sendActivity({
              attachments: itemCards,
              attachmentLayout: "carousel",
            });
            return step.endDialog();
          }

          // Otherwise, run your existing logic:
          // fetch all restaurants, show cards, prompt for a name...
          const resp = await axios.get("http://localhost:5000/restaurant");
          const list = resp.data.Restaurant;
          step.values.restaurants = list;

          const cards = list.map((r) =>
            CardFactory.heroCard(
              r.restaurantName,
              `${r.cuisine.join(", ")} | ${r.location} | ${r.priceRange} | ${
                r.menu.length
              } items`,
              [
                r.imageUrl ||
                  "https://via.placeholder.com/300x200?text=Restaurant",
              ],
              [{ type: "imBack", title: "View Menu", value: r.restaurantName }]
            )
          );
          await step.context.sendActivity({
            attachments: cards,
            attachmentLayout: "carousel",
          });

          return step.prompt(
            PROMPT_TEXT,
            "Type the restaurant name to view its menu:"
          );
        },

        // Step 2: Show menu items with “Add to Cart” buttons
        async (step) => {
          const choice = (step.result || "").toLowerCase();
          const list = step.values.restaurants || [
            step.values.selectedRestaurant,
          ];
          const found = list.find(
            (r) => r.restaurantName.toLowerCase() === choice
          );

          if (!found) {
            await step.context.sendActivity(
              `❌ "${step.result}" not found. Returning to main menu.`
            );
            return step.endDialog();
          }

          if (!found.menu.length) {
            await step.context.sendActivity(
              `🧐 ${found.restaurantName} has no items yet.`
            );
            return step.endDialog();
          }

          // Build and display item cards
          const itemCards = found.menu.map((p) => {
            const avgRating = p.userRating?.length
              ? (
                  p.userRating.reduce((s, r) => s + r.rating, 0) /
                  p.userRating.length
                ).toFixed(1)
              : "No ratings";
            const subtitle = `₹${p.price} | ${p.foodType} | ⭐${avgRating}`;
            return CardFactory.heroCard(
              p.productName,
              subtitle + (p.description ? `\n${p.description}` : ""),
              [p.imageUrl || "https://via.placeholder.com/300x200?text=Dish"],
              [
                {
                  type: "imBack",
                  title: "Add to Cart",
                  value: `addcart ${p._id}`,
                },
              ]
            );
          });

          await step.context.sendActivity({
            attachments: itemCards,
            attachmentLayout: "carousel",
          });
          return step.endDialog();
        },
      ])
    );

    // 13) Cart Dialog (requires login)
    this.dialogs.add(
      new WaterfallDialog(CART_DIALOG, [
        // Step 1: Auth guard
        async (step) => {
          const profile = await this.userProfile.get(step.context, {});
          if (!profile.token) {
            return step.beginDialog(AUTH_DIALOG);
          }
          return step.next();
        },
        async (step) => {
          const cart = await this.cartProperty.get(step.context, []);
          if (!cart.length) {
            await step.context.sendActivity("🛒 Your cart is empty.");
            return step.endDialog();
          }
          const lines = cart.map(
            (i) => `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`
          );
          const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
          await step.context.sendActivity(
            `${lines.join("\n")}\n\nTotal: ₹${total}`
          );
          return step.prompt(
            PROMPT_TEXT,
            "Type an item name to remove it, or “Checkout” to place order."
          );
        },
        async (step) => {
          const text = step.result.trim().toLowerCase();
          let cart = await this.cartProperty.get(step.context, []);
          if (text === "checkout") {
            // Build your order payload from cart
            const { token } = await this.userState
              .createProperty("userProfile")
              .get(step.context);
            try {
              const response = await axios.post(
                "http://localhost:5000/order",
                { customerName, items: cartItems, deliveryAddress: "N/A" },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const {paymentLink} = response.data
              await step.context.sendActivity("✅ Order placed!");
              await this.cartProperty.set(step.context, []);
            } catch (error) {
              const code = error.response?.status;
              if (code === 401 || code === 403) {
                await step.context.sendActivity(
                  "⚠️ Your session expired. Log in again."
                );
                return step.replaceDialog(AUTH_DIALOG);
              }
              await step.context.sendActivity("❌ Checkout failed.");
            }

            return step.endDialog();
          }
          // Remove product
          cart = cart.filter((i) => i.name.toLowerCase() !== text);
          await this.cartProperty.set(step.context, cart);
          await step.context.sendActivity(
            `Removed "${step.result}" from cart.`
          );
          return step.replaceDialog(CART_DIALOG);
        },
      ])
    );

    // 14. Manage Reservations Dialog
    // IDs for new dialogs
    const MANAGE_SINGLE_RES_DIALOG = "manageSingleResDialog";

    // 1) Main “Manage Reservations” dialog
    this.dialogs.add(
      new WaterfallDialog(MANAGE_RES_DIALOG, [
        // Step 1: Auth-guard
        async (step) => {
          const profile = await this.userProfile.get(step.context, {});
          if (!profile.token) return step.beginDialog(AUTH_DIALOG);
          return step.next();
        },

        // Step 2: Fetch and select a reservation
        async (step) => {
          const { token } = await this.userProfile.get(step.context, {});
          const resp = await axios.get(
            "http://localhost:5000/reservation/my-reservations",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const list = resp.data.reservations || [];
          if (!list.length) {
            await step.context.sendActivity(
              "🗓️ You have no active reservations."
            );
            return step.replaceDialog(MAIN_DIALOG);
          }
          // Build choices labeled “Name @ Date Time”
          const choices = list.map(
            (r) => `${r.restaurantName} @ ${r.date} ${r.time} (ID:${r._id})`
          );
          // Store full list for lookup later
          step.values.resList = list;

          return step.prompt(PROMPT_CHOICE, {
            prompt: "🗂️ Select a reservation to manage:",
            choices: ChoiceFactory.toChoices(choices),
            style: ListStyle.suggestedAction,
          });
        },

        // Step 3: Hand off the picked reservation to the single-res dialog
        async (step) => {
          // Extract the ID out of the choice string
          const picked = step.result.value || step.result;
          const id = picked.match(/\(ID:([0-9a-f]{24})\)$/)[1];
          const selected = step.values.resList.find((r) => r._id === id);

          // Begin the looped dialog, passing the selected reservation
          return step.beginDialog(MANAGE_SINGLE_RES_DIALOG, {
            reservation: selected,
          });
        },

        // End after user taps “Back”
        async (step) => {
          // step.result === 'back'
          return step.replaceDialog(MAIN_DIALOG);
        },
      ])
    );

    // 2) Single-reservation management loop
    this.dialogs.add(
      new WaterfallDialog(MANAGE_SINGLE_RES_DIALOG, [
        // A) Prompt the user with View/Update/Cancel/Back
        async (step) => {
          step.values.selectedRes = step.options.reservation;
          const r = step.values.selectedRes;
          const label = `${r.restaurantName} @ ${r.date} ${r.time}`;

          return step.prompt(PROMPT_CHOICE, {
            prompt: `⚙️ Manage: "${label}"`,
            choices: ChoiceFactory.toChoices([
              "View",
              "Update",
              "Cancel",
              "Back",
            ]),
            style: ListStyle.suggestedAction,
          });
        },

        // B) Handle each action and then loop or exit
        async (step) => {
          const action = step.result.value;
          const r = step.values.selectedRes;
          const { token } = await this.userProfile.get(step.context, {});

          if (action === "View") {
            // Show details but **do not** end—re-loop
            await step.context.sendActivity(
              `📝 Details:\n` +
                `• Restaurant: ${r.restaurantName}\n` +
                `• Date: ${r.date}\n` +
                `• Time: ${r.time}\n` +
                `• Guests: ${r.guests}\n` +
                `• Special: ${r.specialRequest || "None"}\n` +
                `• Status: ${r.status}`
            );
            // loop back
            return step.replaceDialog(MANAGE_SINGLE_RES_DIALOG, {
              reservation: r,
            });
          }

          if (action === "Cancel") {
            try {
              await axios.delete(`http://localhost:5000/reservation/${r._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              await step.context.sendActivity("🗑️ Reservation canceled.");
            } catch {
              await step.context.sendActivity("❌ Failed to cancel.");
            }
            // End the dialog right here
            return step.endDialog();
          }

          if (action === "Back") {
            // Exit loop
            return step.next("back");
          }

          // action === “Update” → ask for new date
          return step.prompt(PROMPT_TEXT, "📅 New date? (YYYY-MM-DD)");
        },

        // C) Collect new date
        async (step) => {
          step.values.newDate = step.result.trim();
          return step.prompt(PROMPT_TEXT, "⏰ New time? (HH:MM)");
        },

        // D) Collect new time
        async (step) => {
          step.values.newTime = step.result.trim();
          return step.prompt(PROMPT_TEXT, "👥 New guests count?");
        },

        // E) Apply PATCH, show result, then re-loop
        async (step) => {
          step.values.newGuests = step.result.trim();
          const r = step.values.selectedRes;
          const { newDate, newTime, newGuests } = step.values;
          const { token } = await this.userProfile.get(step.context, {});

          try {
            await axios.patch(
              `http://localhost:5000/reservation/${r._id}`,
              { date: newDate, time: newTime, guests: newGuests },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            await step.context.sendActivity("✅ Reservation updated.");
          } catch {
            await step.context.sendActivity("❌ Update failed.");
          }

          // re-fetch updated reservation for the loop
          const resp = await axios.get(
            `http://localhost:5000/reservation/${r._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const updated = resp.data.reservation;
          return step.replaceDialog(MANAGE_SINGLE_RES_DIALOG, {
            reservation: updated,
          });
        },
      ])
    );

    // 15) Filter Restaurants Dialog
    this.dialogs.add(
      new WaterfallDialog(FILTER_REST_DIALOG, [
        async (step) => {
          const resp = await axios.get("http://localhost:5000/restaurant");
          step.values.allRestaurants = resp.data.Restaurant;
          return step.prompt(PROMPT_CHOICE, {
            prompt: "Filter restaurants by:",
            choices: ChoiceFactory.toChoices([
              "Cuisine",
              "Location",
              "Price Range",
            ]),
          });
        },
        async (step) => {
          step.values.filterBy = step.result?.value ?? step.result;
          const filterBy = step.values.filterBy;
          return step.prompt(
            PROMPT_TEXT,
            `Enter the ${filterBy.toLowerCase()}:`
          );
        },
        async (step) => {
          const term = step.result.toLowerCase();
          const list = step.values.allRestaurants;
          let filtered = [];
          switch (step.values.filterBy) {
            case "Cuisine":
              filtered = list.filter((r) =>
                r.cuisine.some((c) => c.toLowerCase().includes(term))
              );
              break;
            case "Location":
              filtered = list.filter((r) =>
                r.location.toLowerCase().includes(term)
              );
              break;
            case "Price Range":
              filtered = list.filter(
                (r) => r.priceRange.toLowerCase() === term
              );
              break;
          }
          if (!filtered.length) {
            await step.context.sendActivity(
              "No restaurants found for that filter."
            );
            return step.endDialog();
          }
          // Reuse your card helper
          await this._showFilteredCards(step, filtered);
          return step.endDialog();
        },
      ])
    );

    // 1. Manage Orders – show your orders
    this.dialogs.add(
      new WaterfallDialog(MANAGE_ORDERS_DIALOG, [
        // Step 1: Auth guard
        async (step) => {
          const profile = await this.userProfile.get(step.context, {});
          if (!profile.token) return step.beginDialog(AUTH_DIALOG);
          return step.next();
        },

        // Step 2: Fetch user’s orders
        async (step) => {
          const { token } = await this.userProfile.get(step.context, {});
          const resp = await axios.get(
            "http://localhost:5000/order/my-orders",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const list = resp.data.orders || [];
          if (!list.length) {
            await step.context.sendActivity("📭 You have no orders.");
            return step.replaceDialog(MAIN_DIALOG);
          }
          step.values.orders = list;

          const choices = list.map((o) => {
            // build a comma-separated item summary: "Pizza x1, Coke x2"
            const summary = o.items
              .map((i) => `${i.name} x${i.quantity}`)
              .join(", ");

            return {
              value: o._id,
              action: {
                type: "imBack",
                title: `${summary} @ ${o.createdAt.slice(0, 10)}`,
                value: o._id,
              },
            };
          });

          return step.prompt(PROMPT_CHOICE, {
            prompt: "📦 Select an order to track:",
            choices: ChoiceFactory.toChoices(choices),
            style: ListStyle.suggestedAction,
          });
        },

        // Step 3: Hand off to single-order dialog
        async (step) => {
          const orderId = step.result.value;
          const selected = step.values.orders.find((o) => o._id === orderId);
          return step.beginDialog(MANAGE_SINGLE_ORDER_DIALOG, {
            order: selected,
          });
        },

        // Step 4: Back to main menu
        async (step) => {
          return step.replaceDialog(MAIN_DIALOG);
        },
      ])
    );

    // 2) Single‐Order Loop – show bill + buttons
    this.dialogs.add(
      new WaterfallDialog(MANAGE_SINGLE_ORDER_DIALOG, [
        // Step A: Fetch full order and show a bill
        async (step) => {
          const order = step.options.order;
          const { token } = await this.userProfile.get(step.context, {});
          try {
            const resp = await axios.get(
              `http://localhost:5000/order/${order._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const o = resp.data.order;

            // Build invoice lines
            const lines = o.items
              .map(
                (i) =>
                  `• ${i.name} (₹${i.price} × ${i.quantity}) = ₹${
                    i.price * i.quantity
                  }`
              )
              .join("\n");
            const subtotal = o.items.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            );
            const fee = o.deliveryFee || 0;
            const total = subtotal + fee;

            await step.context.sendActivity(
              `🧾 Order #${o._id.slice(-6)} – ${o.createdAt.slice(0, 10)}\n\n` +
                `${lines}\n\n` +
                `Subtotal: ₹${subtotal}\n` +
                `Delivery Fee: ₹${fee}\n` +
                `Total: ₹${total}\n\n` +
                `Status: ${o.status}`
            );
          } catch {
            await step.context.sendActivity("❌ Could not load order details.");
            return step.endDialog();
          }

          // Then offer persistent buttons
          return step.prompt(PROMPT_CHOICE, {
            prompt: "⚙️ What would you like to do next?",
            choices: ChoiceFactory.toChoices([
              "Refresh", // re-fetch and re-display
              "Cancel Order", // call DELETE /order/:id
              "Back", // exit to main menu
            ]),
            style: ListStyle.suggestedAction,
          });
        },

        // Step B: Handle button tap
        async (step) => {
          const action = step.result.value || step.result;
          const o = step.options.order;
          const { token } = await this.userProfile.get(step.context, {});

          if (action === "Back") {
            // exit this loop
            return step.endDialog();
          }

          if (action === "Refresh") {
            // re-run this same waterfall with the same order
            return step.replaceDialog(MANAGE_SINGLE_ORDER_DIALOG, { order: o });
          }

          if (action === "Cancel Order") {
            try {
              await axios.delete(`http://localhost:5000/order/${o._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              await step.context.sendActivity("🗑️ Order cancelled.");
            } catch {
              await step.context.sendActivity("❌ Failed to cancel order.");
            }
            return step.endDialog();
          }

          // should never get here
          return step.endDialog();
        },
      ])
    );

    // Message handler (with Add-to-Cart interception + navigation shortcuts)
    this.onMessage(async (context, next) => {
      const text = context.activity.text?.trim() || "";
      const lower = text.toLowerCase();

      // 1) Handle “addcart <productId>”
      if (lower.startsWith("addcart ")) {
        const handled = await this._handleAddToCart(context);
        if (handled) return;
      }

      // 2) Navigation shortcuts
      const dc = await this.dialogs.createContext(context);
      switch (lower) {
        case "place order":
          await dc.beginDialog(ORDER_DIALOG);
          await this.saveState(context);
          return;
        case "view / manage cart":
          await dc.beginDialog(CART_DIALOG);
          await this.saveState(context);
          return;
        case "browse restaurants":
          await dc.beginDialog(FIND_REST_DIALOG);
          await this.saveState(context);
          return;
        case "discover restaurants":
          await dc.beginDialog(DISCOVERY_DIALOG);
          await this.saveState(context);
          return;
        case "make reservation": // ← new
          await dc.beginDialog(RESERVE_DIALOG);
          await this.saveState(context);
          return;
        case "manage reservations": // ← new
          await dc.beginDialog(MANAGE_RES_DIALOG);
          await this.saveState(context);
          return;
        case "track order":
          await dc.beginDialog(MANAGE_ORDERS_DIALOG);
          await this.saveState(context);
          return;

        case "log in":
          await dc.beginDialog(LOGIN_DIALOG);
          await this.saveState(context);
          return;
        case "sign up":
          await dc.beginDialog(SIGNUP_DIALOG);
          await this.saveState(context);
          return;
      }

      // 3) Continue the active dialog or start main
      const result = await dc.continueDialog();
      if (result.status === DialogTurnStatus.empty) {
        await dc.beginDialog(MAIN_DIALOG);
      }
      await this.saveState(context);
      await next();
    });

    // Welcome
    this.onMembersAdded(async (context, next) => {
      for (const m of context.activity.membersAdded) {
        if (m.id !== context.activity.recipient.id) {
          await context.sendActivity("👋 Hello! Type anything to start.");
        }
      }
      await next();
    });
  }
  // Helper to persist both ConversationState and UserState
  async saveState(context) {
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }

  // Route main menu
  async routeFromMainMenu(step) {
    const choice = step.result?.value ?? step.result;
    switch (choice) {
      case "Browse Restaurants":
        return step.beginDialog(FIND_REST_DIALOG);
      case "View Menu":
        return step.beginDialog(MENU_DIALOG);
      case "Place Order":
        return step.beginDialog(ORDER_DIALOG);
      case "Track Order":
        return step.beginDialog(TRACK_DIALOG);
      case "Make Reservation":
        return step.beginDialog(RESERVE_DIALOG);
      case "View / Manage Cart":
        return step.beginDialog(CART_DIALOG);

      case "Manage Reservations":
        return step.beginDialog(MANAGE_RES_DIALOG);

      case "Filter Restaurants":
        return step.beginDialog(FILTER_REST_DIALOG);
      case "Discover Restaurants":
        return step.beginDialog(DISCOVERY_DIALOG);
      case "Log In":
        return step.beginDialog(LOGIN_DIALOG);

      case "Sign Up":
        return step.beginDialog(SIGNUP_DIALOG);

      default:
        return step.endDialog();
    }
  }
  // Add-to-Cart helper
  async _handleAddToCart(context) {
    const text = context.activity.text.trim();
    const [, productId] = text.split(" ");
    try {
      const resp = await axios.get(
        `http://localhost:5000/product/${productId}`
      );
      const product = resp.data.Product;
      const cart = await this.cartProperty.get(context, []);
      cart.push({
        productId: product._id,
        name: product.productName,
        price: product.price,
        quantity: 1,
      });
      await this.cartProperty.set(context, cart);
      await this.userState.saveChanges(context);
      await context.sendActivity(
        `🛒 Added ${product.productName} x1 to your cart.`
      );
      // 7) Ask what to do next
      await context.sendActivity({
        text: "What would you like to do next?",
        suggestedActions: {
          actions: [
            {
              type: "imBack",
              title: "View / Manage Cart",
              value: "View / Manage Cart",
            },
            { type: "imBack", title: "Place Order", value: "Place Order" },
            {
              type: "imBack",
              title: "Browse Restaurants",
              value: "Browse Restaurants",
            },
            { type: "imBack", title: "Log In", value: "Log In" },
            { type: "imBack", title: "Sign Up", value: "Sign Up" },
          ],
        },
      });
    } catch (e) {
      console.error(e);
      await context.sendActivity("❌ Could not add items to cart.");
    }
    return true;
  }

  // Auth guard that delegates to AUTH_DIALOG
  async ensureAuthenticated(step) {
    // 1) If already have a token, just continue
    const profile = await this.userProfile.get(step.context, {});
    if (profile.token) {
      return step.next();
    }

    // 2) Otherwise launch AUTH_DIALOG (which shows Log In / Sign Up / Cancel buttons)
    const result = await step.beginDialog(AUTH_DIALOG);

    // 3) If they tapped “Cancel”, go back to main menu
    if (result === "cancelled") {
      await step.context.sendActivity("🚪 Returning to main menu.");
      return step.replaceDialog(MAIN_DIALOG);
    }

    // 4) After login/sign-up completes, resume the current waterfall
    return step.next();
  }

  // Place order API call
  async _placeOrderAPI(step) {
    // 1) Gather values
    const address = step.values.deliveryAddress;
    const cart = await this.cartProperty.get(step.context, []);
    const { token, user } = await this.userProfile.get(step.context, {});

    // 2) Build items array matching backend model
    const items = cart.map((i) => ({
      productId: i.productId,
      name: i.name, // ← add this
      price: i.price,
      quantity: i.quantity,
    }));

    // DEBUG: inspect payload in your console
    console.log("📝 Order Payload:", {
      customerName: user.firstName || "Guest",
      items,
      deliveryAddress: address,
    });

    try {
      // 3) POST to /order with correct fields
      const resp = await axios.post(
        "http://localhost:5000/order",
        {
          customerName: user.firstName || "Guest",
          items: items,
          deliveryAddress: address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4) Success → clear cart & inform user
      await step.context.sendActivity(
        `✅ Order #${resp.data.order._id} placed!`
      );
      await this.cartProperty.set(step.context, []);
    } catch (err) {
      // 5) Error → log & surface message
      console.error("Order API error:", err.response?.data || err.message);
      const msg =
        err.response?.data?.message || "❌ Could not place your order.";
      await step.context.sendActivity(msg);

      // 6) If unauthorized → re-authenticate
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        await step.context.sendActivity("⚠️ You need to log in again.");
        return step.replaceDialog(AUTH_DIALOG);
      }
    }

    return step.endDialog();
  }

  // Track order API
  async _trackOrderAPI(step) {
    try {
      const resp = await axios.get(
        `http://localhost:5000/order/${step.result}`
      );
      await step.context.sendActivity(`📦 Status: ${resp.data.status}`);
    } catch (error) {
      const code = error.response?.status;
      if (code === 401 || code === 403) {
        await step.context.sendActivity("⚠️ Session expired. Please log in.");
        return step.replaceDialog(AUTH_DIALOG);
      }
      await step.context.sendActivity("❌ Order not found.");
    }
    return step.endDialog();
  }

  // Make reservation API
  async _makeReservationAPI(step) {
    // 1) Gather values from waterfall
    const { customerName, restaurantName, date, time } = step.values;
    const guests = step.result;
    const { token } = await this.userProfile.get(step.context, {});

    // DEBUG: inspect payload
    console.log("📝 Reservation Payload:", {
      customerName,
      restaurantName,
      date,
      time,
      guests,
    });

    try {
      // 2) POST to /reservation
      const resp = await axios.post(
        "http://localhost:5000/reservation",
        {
          customerName,
          restaurantName,
          date,
          time,
          guests,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3) Success → send confirmation ID
      await step.context.sendActivity(
        `🪑 Reservation ID: ${resp.data.newReservation._id}`
      );
    } catch (err) {
      // 4) Error → log & surf message
      console.error(
        "Reservation API error:",
        err.response?.data || err.message
      );
      const msg =
        err.response?.data?.message || "❌ Could not make reservation.";
      await step.context.sendActivity(msg);

      // 5) If unauthorized
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        await step.context.sendActivity("⚠️ You need to log in.");
        return step.replaceDialog(AUTH_DIALOG);
      }
    }

    return step.endDialog();
  }

  // Show restaurant cards
  async _showRestaurantCards(step) {
    const resp = await axios.get("http://localhost:5000/restaurant");
    const list = resp.data.Restaurant;
    const cards = list.map((r) =>
      CardFactory.heroCard(
        r.restaurantName,
        `${r.cuisine.join(", ")} | ${r.location} | ${r.priceRange} | ${
          r.menu.length
        } items`,
        [r.imageUrl || "https://via.placeholder.com/300x200?text=Restaurant"],
        []
      )
    );
    await step.context.sendActivity({
      attachments: cards,
      attachmentLayout: "carousel",
    });
    return step.endDialog();
  }
  async _showFilteredCards(step, list) {
    const cards = list.map((r) =>
      CardFactory.heroCard(
        r.restaurantName,
        `${r.cuisine.join(", ")} | ${r.location} | ${r.priceRange}`,
        [r.imageUrl || "https://via.placeholder.com/300x200"],
        []
      )
    );
    await step.context.sendActivity({
      attachments: cards,
      attachmentLayout: "carousel",
    });
  }
}

module.exports = RestaurantBot;
