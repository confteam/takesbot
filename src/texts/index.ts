export const botError = "Произошла ошибка на стороне бота.";

export const startText = "Привет! Это бета версия бота для конфешнов. Напиши свой тейк и мы его скорее всего опубликуем.";

export const takeText = "Напишите ваш тейк.";

export const takeSent = (id: string) => `Тейк был успешно отправлен. Номер - ${id}.`;

export const botNotAdded = (code: string) => `Бот не добавлен в группу либо в канал. Добавьте бота в канал и группу, а затем отправьте туда следующий код: ${code}`;

export const takeAuthor = (author: string) => `Тейк от: @${author}`;

export const onAddToGroup = "Бот успешно добавлен в группу.";

export const onAddToChannel = "Бот успешно добавлен в канал.";

export const takeAccepted = (id: string) => `Ваш тейк под номером ${id} был принят.`;

export const takeRejected = (id: string) => `Ваш тейк под номером ${id} был отклонен.`;

export const settingsText = "⚙️Настройки";

export const unsupportedTake = "Неподдерживаемый тип сообщения.";

export const mediaGroupNotFound = "Из-за особенности телеграма нам приходится хранить все альбомы в памяти бота, видимо, прошло слишком много времени с момента отправки этого тейка и бот не может получить альбом."

export const banned = "Вы были забанены.";

export const bannedWithReason = (id: string) => `Вы были забанены из-за тейка под номером ${id}.`;

export const unban = "Вы были разбанены.";

export const reply = (text: string, id: string) => `Новый ответ на тейк под номером ${id}: ${text}.`;

export const userBan = "Пользователь был забанен.";

export const userUnban = "Пользователь был разбанен.";

export const userReply = "Ответ отправлен.";
