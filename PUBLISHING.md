# Публикация Quarto Feedback 0.1.1

Идентификатор расширения: **vladissta.quarto-feedback**. Лицензия: **MIT**. Один универсальный VSIX используется для обоих магазинов. Этот документ описывает следующие шаги; подготовка пакета сама по себе не создаёт аккаунты и не публикует расширение.

## 1. Проверка и сборка

Из папки исходников:

```sh
npm ci
npm run check
npm test
npm run package
```

Результат: `dist/quarto-feedback-0.1.1.vsix`. Для проверки состава используйте `npm run package:contents`. В пакет не входят инструменты разработки, тесты, логи или примеры студенческих работ.

Повторяемые проверки редакторов описаны в CONTRIBUTING.md. Перед публикацией можно установить VSIX в отдельном профиле редактора через Extensions: Install from VSIX и вручную проверить Cmd+Option+A / Ctrl+Alt+A.

Если в рабочем профиле установлена прежняя копия `local-feedback.quarto-feedback`, удалите её до установки публичной: две копии используют одинаковый идентификатор команды. Это не удаляет замечания из `.qmd`.

## 2. Visual Studio Marketplace — ручная загрузка

Для первого выпуска проще загрузить готовый пакет через сайт: токен командной строки для этого не нужен.

1. Войдите своей учётной записью Microsoft на https://marketplace.visualstudio.com/manage .
2. Создайте издателя с ID **vladissta**, если он ещё не создан. Уникальность и доступность этого ID не подтверждены подготовкой пакета. Если ID уже принадлежит вам, выберите его. Если ID занят другим пользователем, необходимо выбрать другой, изменить `publisher` и проверку идентичности в `scripts/check-release.js`, затем пересобрать пакет.
3. Откройте **New extension → Visual Studio Code** и выберите готовый `.vsix`.
4. Проверьте название, описание, автора и лицензию. Подтвердите публикацию самостоятельно после проверки условий магазина.
5. Дождитесь проверки/доступности и установите расширение из магазина в чистый профиль VS Code.

Альтернатива — официальный инструмент `vsce publish`. Актуальная документация рекомендует Microsoft Entra ID для автоматизации; глобальные PAT Azure DevOps выводятся из использования с 1 декабря 2026 года. Для первого ручного выпуска описанная выше загрузка VSIX проще.

Документация Microsoft: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## 3. Open VSX — для Positron и других совместимых редакторов

Публикация в Marketplace Microsoft не добавляет расширение в каталог Positron. Опубликуйте тот же пакет в Open VSX.

1. Войдите через GitHub на https://open-vsx.org .
2. Создайте/свяжите Eclipse-аккаунт с тем же GitHub-именем. Прочитайте и самостоятельно примите **Publisher Agreement** в профиле Open VSX.
3. Создайте токен в Settings → Access Tokens. Храните его локально; не вставляйте в чат, исходники или README.
4. Создайте namespace **vladissta** или убедитесь, что ваша учётная запись имеет право публикации в нём.
5. Опубликуйте проверенный VSIX с помощью установленного `ovsx`.

Ниже команды для Terminal на Mac. Они запрашивают токен без отображения и не сохраняют его в историю команд. Выполняйте создание namespace только если он ещё не существует; при существующем namespace переходите к проверке доступа.

```sh
read -rs 'OVSX_PAT?Open VSX token: '
export OVSX_PAT
npm exec -- ovsx create-namespace vladissta
npm exec -- ovsx verify-pat vladissta
npm exec -- ovsx publish dist/quarto-feedback-0.1.1.vsix
unset OVSX_PAT
```

`read` выше использует синтаксис стандартного macOS shell zsh. Для другой оболочки задайте `OVSX_PAT` её способом. Публикация/создание namespace — внешние действия; запускайте их только когда хотите опубликовать пакет. Проверка владельца namespace отдельно от его создания описана в документации Open VSX.

После публикации проверьте страницу расширения на Open VSX и установку через каталог Positron. Индексация каталога может занимать время.

Документация Open VSX: https://github.com/eclipse-openvsx/openvsx/wiki/Publishing-Extensions
Документация каталога Positron: https://positron.posit.co/extensions.html

## Репозиторий и подтверждение владельца

Исходники: https://github.com/vladissta/quarto-feedback . В package.json указаны repository, homepage и bugs.

Для заявки Open VSX по варианту **VS Code Publisher with Repo** сначала загрузите версию 0.1.1 в Marketplace Microsoft и дождитесь появления ссылки на этот репозиторий. Затем отправьте запрос Claim Ownership для namespace vladissta: https://github.com/EclipseFdn/open-vsx.org/issues/new?template=claim-namespace-ownership.yml&namespace=vladissta . Укажите, что репозиторий принадлежит GitHub-аккаунту заявителя, и приложите ссылку на него и на Marketplace-публикацию. После подтверждения администраторами проверьте, что расширение в Open VSX активно.

Поле private: true предотвращает случайную публикацию исходного npm-пакета в npm; оно не мешает публикации VSIX. Для следующего выпуска увеличьте версию, обновите CHANGELOG.md, повторите проверки и загрузите одинаковую версию в оба магазина.
