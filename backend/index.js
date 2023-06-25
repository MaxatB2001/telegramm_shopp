const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const { connectDB } = require("./db.config");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middlewares/ErrorHandlingMiddleware");
const fileUpload = require("express-fileupload");
const router = require("./routes/index");
const Category = require("./models/category.model");
const Cart = require("./models/cart.model");
const Order = require("./models/order.mkdel");
const ShopReview = require("./models/shopReview.model");
const User = require("./models/User.model");
const token = "6010021020:AAGDrMwHEe_8Y0O7XJxpfWo2hyHnRBHcFW4";
const url = "https://8624-95-105-69-54.ngrok-free.app";
const backUrl  ="https://2f97-95-105-69-54.ngrok-free.app"
const bot = new TelegramBot(token, { polling: true });

function numberWithSpaces(nr) {
  return nr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
connectDB();
const app = express();
app.use(cors(corsOptions)); 
app.use(express.json());
app.use(fileUpload({}));
app.use(express.static(path.resolve(__dirname, "static")));
app.use("/api", router);
app.use(errorHandler);

app.listen(5000, () => console.log(`server started`));
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  await bot.getChatMenuButton({chat_id: chatId})
  const text = msg.text;

  if (text == "/start") {
    await bot.sendMessage(chatId, "Добро пожаловать!", {
      reply_markup: {
        keyboard: [
          [{ text: "Каталог 📂" }, { text: "Корзина 📮" }, { text: "Профиль 🙋" }],
          [{ text: "Поддержка ❓" }, { text: "Настройки 🔧" }],
          [{ text: "Отзывы 📢" }],
        ],
      },
    });
  }

  if (text == "Отзывы 📢") {
    await bot.sendMessage(chatId, "Отзывы", {
      reply_markup: {
        keyboard: [
          [{ text: "Оставить отзыв" }, { text: "Посмотреть отзывы" }],
        ],
      },
    });
  }

  if (text == "Посмотреть отзывы") {
    const reviews = await ShopReview.find()
    reviews.forEach(r => {
      bot.sendMessage(chatId, `${r.userName}
${r.body}`)
    })
  }

  if (text == "Оставить отзыв") {
    const reviewNumber = await bot.sendMessage(
      msg.chat.id,
      "Введите ваш отзыв",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(msg.chat.id, reviewNumber.message_id, async (phoneMsg) => {
      const review = phoneMsg.text;
      await ShopReview.create({userName: msg.from.first_name, body: review})
      // save name in DB if you want to ...
      await bot.sendMessage(msg.chat.id, `Спасибо за оставленный отзыв!`);
  });
  }
  
  if (text == "Каталог 📂") {
    const categories = await Category.find();
    await bot.sendMessage(chatId, "Каталог", {
      reply_markup: {
        inline_keyboard: categories.map((item) => [
          { text: item.title, web_app: { url: url + "/" + item.title } },
        ]),
      },
    });
  }

  if (text == "Профиль 🙋") {
    let user = await User.findOne({name: msg.from.first_name})
    if (!user) {
      user = await User.create({name: msg.from.first_name})
    } 
    await bot.sendMessage(chatId, `
    Имя: ${user.name}
Телефон: +${user.phone}
Адрес доставки: ${user.adress}`,
{
  reply_markup: {
    inline_keyboard: [[{ text: "История заказов ⭐", callback_data: "orders" }]],
  },
}
)
  }


  if (text == "Поддержка ❓") {
    // await bot.sendMessage(chatId ,"Задайте свой вопрос сотруднику техподдержки.")
    const questionNumber = await bot.sendMessage(
      msg.chat.id,
      "Введите ваш вопрос",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(msg.chat.id, questionNumber.message_id, async (msg) => {
      const question = msg.text;
      // save name in DB if you want to ...
      await bot.sendMessage(msg.chat.id, `ваш вопрос успешно отправлен!`);
  });
  }


  if (text == "Корзина 📮") {
    let sum = 0
    let cart = await Cart.findOne({ userName: msg.from.first_name }).populate(
      "items"
    );
    console.log(cart);
    if (cart.items.length > 0) {
      cart.items.forEach((element) => {
        sum += element.cost
        bot
          .sendPhoto(
            chatId,
            `${backUrl}/${element.picture}`,
            {
              caption: `${element.name} 
Цена: ${numberWithSpaces(element.cost)} ₽
Размер: S`,
              reply_markup: {
                inline_keyboard: [[{ text: "❌", callback_data: element._id }]],
              },
            }
          )
          .then((data) => console.log(data));
      });
      setTimeout(async () => {
        await bot.sendMessage(chatId, `
Желаете оформить заказ ?
Сумма заказа: ${sum} ₽
Количество товаров: ${cart.items.length}
`, {reply_markup: {
          inline_keyboard: [[{ text: "✅", callback_data: "offer" }]],
        },})
      }, 1000)
    } else {
      bot.sendMessage(
        chatId,
        `В корзине пусто 😔
перейдите в Каталог, там много интересного`
      );
    }
    // console.log(cart);
    // return res.json(cart)
  }

  if (text == "Настройки 🔧") {
    await bot.sendMessage(chatId, "Изменение личных данных", {
      reply_markup: {
        keyboard: [
          [{ text: "Имя 😃" }, { text: "Адрес 🏡" }],
          [ { text: "Телефон 📞" },],
        ],
      },
    });
  }

  if (text == "Телефон 📞") {
    let user = await User.findOne({name: msg.from.first_name})
    if (!user) {
      user = await User.create({name: msg.from.first_name})
    } 
    const phoneNumber = await bot.sendMessage(
      msg.chat.id,
      "Ваш номер телефона",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(msg.chat.id, phoneNumber.message_id, async (phoneMsg) => {
      const phone = phoneMsg.text;
      user.phone = phone
      await user.save()
      await bot.sendMessage(msg.chat.id, `ваш телефон успешно сохранён ${phone}!`);
  });
  }

  if (text == "Адрес 🏡") {
    let user = await User.findOne({name: msg.from.first_name})
    if (!user) {
      user = await User.create({name: msg.from.first_name})
    } 
    const adressNumber = await bot.sendMessage(
      msg.chat.id,
      "Ваш адрес",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(msg.chat.id, adressNumber.message_id, async (adressMsg) => {
      const adress = adressMsg.text;
      user.adress = adress
      await user.save()
      await bot.sendMessage(msg.chat.id, `ваш адрес успешно сохранён ${adress}!`);
  });
  }

  if (text == "Имя 😃") {
    let user = await User.findOne({name: msg.from.first_name})
    if (!user) {
      user = await User.create({name: msg.from.first_name})
    } 
    const namePrompt = await bot.sendMessage(
      msg.chat.id,
      "Ваше имя ?",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(msg.chat.id, namePrompt.message_id, async (nameMsg) => {
      const name = nameMsg.text;
      user.name = name
      await user.save()
      await bot.sendMessage(msg.chat.id, `Ваше имя ${name}!`);
  });
  }

  bot.on("callback_query", async (msg) => { 
    
    if (msg.data === "orders") {
      let orders = await Order.find({userName: msg.from.first_name}).populate("items");
      await bot.sendMessage(chatId, "Ваши заказы")
      for (let o of orders) {
        await  bot.sendMessage(chatId, `номер заказа ${o._id}`)
        for (let oi of o.items) {
          await bot.sendPhoto(chatId, `${backUrl}/${oi.picture}`, {
            caption: `${oi.name} 
Цена: ${numberWithSpaces(oi.cost)} ₽
Размер: S`,
          })
        }
      }

    } else if (msg.data === "offer") {
      let cart = await Cart.findOne({ userName: msg.from.first_name }).populate(
        "items"
      );
      let sum = 0
      cart.items.forEach(i => {
        sum += i.cost
      })
      let order = await Order.create({userName: cart.userName, items: cart.items, sum})
      await bot.sendMessage(chatId, `Заказ успешно оформлен
Номер заказа: ${order._id} 
Сумма заказа: ${sum} ₽`)
    } else {
      console.log(msg.data);
      let cart = await Cart.findOne({ userName: msg.from.first_name }).populate(
        "items"
      );
      cart.items = cart.items.filter((item) => item._id != msg.data);
      await cart.save();
      await bot.sendMessage(chatId, `Товар удалён из корзины 
  количество товаров в корзине ${cart.items.length}`)
    }
  });
});
