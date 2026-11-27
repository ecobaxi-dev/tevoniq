# نسخ قاعدة البيانات المشفرة إلى Google Drive

هذا الإعداد يكمل النسخ المحلية اليومية؛ لا يغيّر القاعدة ولا إعدادات الموقع. يتم تشفير المحتوى وبيانات snapshots بواسطة Restic على Ubuntu قبل رفعها إلى مستودع مستقل `TEVONIQ-Backups/restic` في My Drive. لا تستخدم مجلدات تنزيل بيستو العامة. لا تنشر مجلد النسخ ولا تشاركه.

## السياسة

- محليًا: 14 يومًا مع إبقاء أحدث نسختين سليمتين مهما كان عمرهما. الملفات غير المعروفة أو الناقصة أو الروابط الرمزية لا تُحذف.
- في المستودع المشفر: آخر نسخة لكل يوم من 14 يومًا، ولكل أسبوع من 8 أسابيع، ولكل شهر من 6 أشهر، وفق سياسة Restic. ليست هذه بالضرورة 28 أو 180 نسخة يومية.
- لا تُطبق سياسة الحذف إلا بعد نجاح الرفع واسترجاع النسخة نفسها وفك تشفيرها ومقارنتها بايتًا ببايت وفحص المستودع.
- لا تنفذ الأداة `sync` أو `purge` على Google Drive. عمليات Restic محصورة في مستودعه ووسم `tevoniq-postgres` والمضيف `tevoniq-home`، مع تجميع الاحتفاظ بحسب host,tags.
- الملفات المتقادمة تُحذف وفق السياسة؛ هذه سياسة احتفاظ وليست حدًا صارمًا للحجم. عند فشل الرفع تبقى النسخ المحلية وقد تنمو المساحة، لذا يلزم مراقبة الفشل والقرص.
- هذه نسخ قاعدة البيانات فقط. ملفات الوسائط وإعدادات التشغيل والأسرار تحتاج خطة مستقلة قبل اعتبار النسخ شاملة للخادم.

## 1. تثبيت وربط Google Drive

على Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y restic rclone
sudo install -d -m 700 /root/.config/rclone
```

من Terminal الماك، افتح اتصالًا جديدًا يدعم إتمام OAuth المحلي على الماك دون فتح منفذ عام:

```bash
ssh -t -o ExitOnForwardFailure=yes -L 53682:127.0.0.1:53682 tevoniq@192.168.1.133 \
  'sudo rclone config --config /root/.config/rclone/rclone.conf'
```

اختر `n`، واسم الاتصال `tevoniq-drive`، والنوع `drive`. اترك client_id وclient_secret فارغين لاستخدام تطبيق rclone الافتراضي. للنطاق اختر القيمة `drive.file` (الوصول للملفات التي ينشئها rclone فقط)، واترك service_account_file فارغًا. اختر عدم تعديل الخيارات المتقدمة. عند السؤال عن متصفح المصادقة اختر `y`؛ افتح رابط `http://127.0.0.1:53682/...` المعروض في متصفح الماك. لا ترسل الرابط أو رمز OAuth في المحادثة. راجع صلاحية Google بنفسك ووافق إن كانت مطابقة لغرض النسخ. لا تستخدم Shared Drive؛ اختر `n` ثم احفظ بـ`y` واخرج بـ`q`. إذا اختلفت الأسئلة، شارك نص السؤال دون رموز سرية.

لا يعيد التطبيق ربط حساب Google أو يوسع الصلاحيات تلقائيًا. صلاحية drive.file لا تمنح rclone قراءة ملفاتك القديمة أو مجلدات التنزيل التي أُنشئت بطرق أخرى.

## 2. إنشاء المستودع وكلمة استعادته

بعد الربط داخل SSH:

```bash
cd ~/apps/tevoniq
git pull --ff-only
sudo bash scripts/home/install-offsite.sh --init
```

ينشئ البرنامج كلمة عشوائية بصلاحية 600 في `/etc/tevoniq-backup/restic-password` ولا يطبعها. **فقدان هذه الكلمة مع الخادم يعني فقدان القدرة على استعادة النسخ**. لا يُفعّل المؤقت قبل حفظها خارج الخادم. عند إعادة تشغيل المثبت لمستودع قائم، احذف `--init`؛ لن يعيد إنشاء المستودع عند فشل الاتصال أو كلمة المرور.

جهز نسخة نقل خاصة بالمستخدم داخل SSH:

```bash
sudo install -o tevoniq -g tevoniq -m 600 \
  /etc/tevoniq-backup/restic-password /home/tevoniq/tevoniq-backup-recovery-key
```

ثم على الماك:

```bash
mkdir -p ~/Backups/TEVONIQ
chmod 700 ~/Backups/TEVONIQ
(umask 077; scp tevoniq@192.168.1.133:~/tevoniq-backup-recovery-key \
  ~/Backups/TEVONIQ/tevoniq-backup-recovery-key)
```

احفظ كلمة الاستعادة أيضًا في مدير كلمات مرور أو وسيط خاص آمن؛ لا ترفعها إلى مستودع النسخ نفسه. احفظ معها اسم حساب Google ومسار المستودع. بعد التأكد من النسخة على الماك، احذف ملف النقل فقط داخل SSH:

```bash
rm ~/tevoniq-backup-recovery-key
```

تبقى كلمة التشغيل الأصلية في `/etc/tevoniq-backup/`. بيانات OAuth في ملف rclone خاصة بـroot ولا تُطبع.

## 3. التجربة والتفعيل

بعد حفظ كلمة الاستعادة خارج الجهاز:

```bash
sudo systemctl start tevoniq-offsite.service
sudo systemctl status tevoniq-offsite.service --no-pager -l
```

نجاح خدمة oneshot يعني ظهور `Result=success` و`ExecMainStatus=0`، وقد يكون ActiveState=inactive بعد انتهائها. يجب رؤية رسالة نجاح التحقق من التنزيل والمقارنة؛ وجود مجلد Drive وحده لا يثبت سلامة النسخ.

بعد نجاح التشغيل الأول:

```bash
sudo systemctl enable --now tevoniq-offsite.timer
sudo systemctl list-timers tevoniq-offsite.timer --no-pager
```

الموعد 03:15 UTC (06:15 إسطنبول) مع تأخير عشوائي حتى خمس دقائق، ويُعوَّض التشغيل الفائت عند عودة الجهاز. تشغّل الاعتمادية نسخة محلية جديدة أولًا. تعاد محاولة الرفع الفاشلة بعد 15 دقيقة، حتى ثلاث بدايات في الساعة. لا تعطل مؤقت `tevoniq-backup.timer` المحلي الموجود.

التحقق من النجاح لاحقًا:

```bash
sudo systemctl show tevoniq-offsite.service -p Result -p ExecMainStatus
sudo journalctl -u tevoniq-offsite.service -n 35 --no-pager
```

## الاستعادة

احتفظ بنسخة من هذه التعليمات خارج الخادم أيضًا. يمكن استعادة مستودع Restic بعد ربط Drive مجددًا بتطبيق rclone نفسه، أو تنزيل ملفات المستودع المشفر من Drive لاستعادتها محليًا، باستخدام كلمة الاستعادة المحفوظة. قبل أي استعادة إلى الإنتاج، استرجع dump في مكان خاص واختبره في قاعدة منفصلة كما فعلنا سابقًا. لا تشغل pg_restore على القاعدة الحية مباشرة.

مثال استخراج آخر dump على الخادم، دون تعديل PostgreSQL:

```bash
sudo bash -c 'set -a; . /etc/tevoniq-backup/offsite.env; set +a; umask 077; restic dump --host tevoniq-home --tag tevoniq-postgres latest /database.dump > /root/tevoniq-restore.dump'
```

لم تختبر بيئة التأليف Google OAuth أو الرفع الفعلي؛ يلزم تنفيذ التجربة أعلاه والتحقق من الاستعادة بعد الربط. اختبارات المشروع تتحقق من مسارات النجاح والفشل بالمحاكاة ومن عدم حذف النسخ قبل نجاح التحقق.

المراجع: [Restic والتشفير وكلمة المستودع](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html)، [نطاق صلاحية Drive](https://rclone.org/drive/#scopes)، [OAuth عبر SSH tunnel](https://rclone.org/remote_setup/).
