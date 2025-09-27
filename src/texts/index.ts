export const botError = "Произошла ошибка на стороне бота.";

export const startText = "Привет! Это бета версия бота для конфешнов. Если ты хочешь отправить тейк, выбери один из вариантов ниже.";

export const choiceResult = (choice: string) => `Вы выбрали: ${choice === "anon" ? "Анонимно" : "Неанонимно"}.`;

export const takeText = "Напишите ваш тейк.";

export const takeSent = (id: string) => `Тейк был успешно отправлен. Номер - ${id}.`;

export const botNotAdded = (code: string) => `Бот не добавлен в группу либо в канал. Добавьте бота в канал и группу, а затем отправьте туда следующий код: ${code}`;

export const takeAuthor = (author: string) => `Тейк от: @${author}`;

export const onAddToGroup = "Бот успешно добавлен в группу.";

export const onAddToChannel = "Бот успешно добавлен в канал.";

export const takeAccepted = (id: string) => `Ваш тейк под номером ${id} был принят.`;

export const takeRejected = (id: string) => `Ваш тейк под номером ${id} был отклонен.`;
