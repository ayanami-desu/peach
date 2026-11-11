/* 首次设置表单。题目、默认值、显隐与随平台变化的文案来自 `GET /api/setup/questions`；
 * 分组标题、按钮与「完成设置后」那一组是页面骨架，写在这里。
 *
 * 提交走 `POST /api/setup`。400 的 `errors` 按题目 key 写回原位：高级设置里任一项出错就展开它，
 * 访问密码出错时开关保持打开。已填的内容都留在原地，焦点落到第一个标错的框。 */
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { RiFolderLine, RiSearchLine, RiPlayCircleLine } from '@remixicon/react';

import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';
import { Switch } from '@/components/base/switch/switch';

import { Note } from '../../components/note';
import { ConfigurationChoice, ConfigurationInput } from '../../components/configuration-fields';
import { busyProps } from '../../settings/busy-props';
import { PasswordPair } from '../../settings/password-pair';
import { Disclosure, ErrorText, Fact, FactList, Help } from '../../settings/section';
import { CardGroup, GroupTitle } from '../auth-card';
import {
  describeFailure, pickFolder, SetupRequestError, submitSetup,
  type SetupDone, type SetupErrors, type SetupQuestion, type SetupQuestions, type SetupSubmission,
} from './setup-api';
import { SetupShell } from './setup-scene';

/** 这几项出错时「高级设置」自己展开：错在折叠里的框，人看不见。 */
const ADVANCED_KEYS = ['port', 'mdns_name'];

const text = (value: SetupErrors[string]) => (Array.isArray(value) ? value.filter(Boolean).join(' ') : value ?? '');

export function SetupForm({ setup, onDone, onRestore }: { setup: SetupQuestions; onDone: (done: SetupDone) => void; onRestore?: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const stepScroll = useRef<HTMLDivElement>(null);
  const move = (next: number) => { setDirection(next > step ? 1 : -1); setStep(next); };
  useEffect(() => {
    stepTitle.current?.focus({ preventScroll: true });
    stepScroll.current?.scrollTo({ top: 0 });
  }, [step]);
  const dataRoot = setup.questions.find((question) => question.input === 'folder');
  const fields = setup.questions.filter((question) => question.input !== 'folders');
  const host = fields.find((question) => question.key === 'host');
  const others = fields.filter((question) => question.input !== 'folder' && question.key !== 'host');
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(fields.map((question) => [question.key, question.default])));
  const [pickingData, setPickingData] = useState(false);
  const [pickError, setPickError] = useState('');
  const preset = Boolean(setup.access_preset);
  const [accessOn, setAccessOn] = useState(setup.access_enabled && !preset);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<SetupErrors>({});
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  // 每次因为错误要展开就换一个 key：折叠按初始状态展开，已填的值都在这一层的 state 里。
  const [advancedOpenings, setAdvancedOpenings] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  // 写回之后焦点交给第一个标错的框。错误在 await 之后才到，React 不在点击那一刻同步提交，
  // 所以等这一轮落到 DOM 上再找，不赌下一帧之前一定画完。
  const [errorRound, setErrorRound] = useState(0);
  useEffect(() => {
    if (errorRound) [...(form.current?.querySelectorAll<HTMLElement>('input[aria-invalid="true"]') ?? [])]
      .find(input => !input.closest('[hidden]'))?.focus();
  }, [errorRound]);
  // 写回的错误放进框下的提示：`role="alert"` 让读屏在它出现时播报一次，提示本身仍由
  // `aria-describedby` 挂在框上，文字在页面上只有这一份。`key` 跟着提交轮次换，同一句错误
  // 再提交一次也会重新播报。
  const announce = (message: string | undefined) =>
    message ? <span key={errorRound} role="alert">{message}</span> : undefined;

  const visible = (question: SetupQuestion) =>
    !question.visible_when || Object.entries(question.visible_when).every(([key, value]) => values[key] === value);
  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (step < 3) {
      move(step + 1);
      return;
    }
    setBusy(true);
    setFailure('');
    const submission: SetupSubmission = { access_enabled: accessOn };
    // 隐藏的题不提交，服务端按题目默认值补上。
    for (const question of fields) if (visible(question)) submission[question.key] = values[question.key] ?? '';
    if (accessOn) Object.assign(submission, { access_password: password, access_confirm: confirmation });
    try {
      onDone(await submitSetup(submission));
    } catch (cause) {
      if (cause instanceof SetupRequestError && cause.status === 400 && cause.errors) {
        const found = cause.errors;
        setErrors(found);
        if (ADVANCED_KEYS.some((key) => found[key])) setAdvancedOpenings((count) => count + 1);
        if (found.access_password) setAccessOn(true);
        move(dataRoot && found[dataRoot.key] ? 1 : 2);
        setErrorRound((count) => count + 1);
      } else {
        setFailure(describeFailure(cause));
      }
    } finally {
      setBusy(false);
    }
  };

  const field = (question: SetupQuestion) => {
    const error = text(errors[question.key]);
    const help = question.help.join('');
    if (question.input === 'choice') {
      return (
        <ConfigurationChoice key={question.key} id={`setup-${question.key}`} label={question.label}
          value={values[question.key] ?? question.default} onChange={(value) => setValue(question.key, value)}
          options={question.options ?? []} isInvalid={Boolean(error)}>
          {help ? <Help>{help}</Help> : null}
          {error ? <ErrorText key={errorRound}>{error}</ErrorText> : null}
        </ConfigurationChoice>
      );
    }
    return (
      <ConfigurationInput key={question.key} id={`f-${question.key}`} label={question.label} isRequired={question.required}
        inputMode={question.input === 'number' ? 'numeric' : undefined} autoComplete="off" spellCheck="false"
        value={values[question.key] ?? ''} onChange={(value) => setValue(question.key, value)}
        prefix={question.prefix} suffix={question.suffix}
        validationBehavior="aria" isInvalid={Boolean(error)} hint={announce(error) ?? (help || undefined)} />
    );
  };

  const pickDataRoot = async () => {
    if (!dataRoot || pickingData) return;
    setPickingData(true);
    setPickError('');
    try {
      const path = await pickFolder(values[dataRoot.key] ?? '');
      if (path) setValue(dataRoot.key, path);
    } catch (cause) {
      setPickError(describeFailure(cause));
    } finally {
      setPickingData(false);
    }
  };
  const dataRootError = dataRoot ? text(errors[dataRoot.key]) || pickError : '';

  const lan = values.host === '2';
  const address = lan
    ? `https://${values.mdns_name || 'peach'}.local/`
    : `http://127.0.0.1:${values.port || '8900'}/`;
  return (
    <SetupShell step={step}>
    <form ref={form} noValidate onSubmit={(event) => void submit(event)} aria-labelledby="auth-card-title"
      data-setup-form-panel="">
      <div data-setup-top="">
        <div data-setup-progress="" role="img" aria-label={`首次设置，第 ${step + 1} 步，共 4 步`}>
          {[0, 1, 2, 3].map(index => <span key={index} data-active={index === step || undefined} data-complete={index < step || undefined} />)}
        </div>
        <span className="text-body-2-regular text-text-secondary">首次设置</span>
      </div>
      <div data-setup-step-scroll="" ref={stepScroll}>
      <div data-setup-step-content="" style={{ '--setup-direction': `${direction * 20}px` } as CSSProperties}>
        <header data-setup-step-heading="" key={step}>
          <h1 id="auth-card-title" data-copy-key={`setup.title.${step}`} ref={stepTitle} tabIndex={-1} className="text-title-1-semibold text-text-primary">
            {step === 0 ? '欢迎使用 Peach' : step === 1 ? '数据目录放在哪里？' : step === 2 ? (setup.docker ? '访问与网络' : '在哪里使用 Peach？') : '准备好开始了'}
          </h1>
          <p data-copy-key={`setup.description.${step}`} className="text-body-regular text-text-secondary">
            {step === 0 ? '花一点时间，让 Peach 更适合你。' : step === 1 ? '数据库、缓存和设置文件都放在这个目录。'
              : step === 2 ? (setup.docker ? '为馆藏设置访问密码；网盘授权回调的基址在高级设置里。' : '选择访问范围，也可以为馆藏设置密码。')
              : '确认这些选择，剩下的交给 Peach。'}
          </p>
        </header>
      <div hidden={step !== 0}>
        <ul data-setup-welcome-points="">
          <li><RiFolderLine /><div data-setup-welcome-copy=""><strong className="text-body-medium">先确认数据目录</strong><p className="text-body-2-regular text-text-secondary">数据库、缓存和设置文件都存在这里，之后可以在设置里改动。</p></div></li>
          <li><RiSearchLine /><div data-setup-welcome-copy=""><strong className="text-body-medium">更快找到想看的</strong><p className="text-body-2-regular text-text-secondary">用搜索、标签和收藏浏览馆藏。</p></div></li>
          <li><RiPlayCircleLine /><div data-setup-welcome-copy=""><strong className="text-body-medium">按你的习惯播放</strong><p className="text-body-2-regular text-text-secondary">播放与外观偏好，可以随时在设置里调整。</p></div></li>
        </ul>
      </div>
      <div hidden={step !== 1}>
      {dataRoot ? (
        <CardGroup labelledBy="setup-data-title">
          <GroupTitle id="setup-data-title">
            {dataRoot.label}<span aria-hidden className="ml-0.5 text-text-error-primary">*</span>
          </GroupTitle>
          <div className="flex items-start gap-2">
            <Input className="min-w-0 flex-1" id={`f-${dataRoot.key}`} aria-label={dataRoot.label} isRequired
              autoComplete="off" spellCheck="false" value={values[dataRoot.key] ?? ''}
              onChange={(value) => setValue(dataRoot.key, value)}
              validationBehavior="aria" isInvalid={Boolean(dataRootError)} hint={announce(dataRootError)} />
            <IconButton icon={RiFolderLine} aria-label="选择数据目录" onClick={() => void pickDataRoot()}
              {...busyProps(pickingData)} />
          </div>
          {dataRoot.help.map((line) => <Help key={line}>{line}</Help>)}
        </CardGroup>
      ) : null}

      </div>
      <div hidden={step !== 2}>
      <CardGroup first labelledBy="auth-card-title">
        {host ? field(host) : null}
        {preset ? <>
          <Label elementType="span">访问密码</Label>
          <Note tone="info">已按 PEACH_ACCESS_PASSWORD 设置访问密码，可在配置页「网络与访问」修改。</Note>
        </> : <>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Label id="setup-password-title" elementType="span">访问密码</Label>
            <p id="setup-access-description" className="text-body-2-regular text-text-secondary">开启后，访问 Peach 需要先登录。</p>
          </div>
          <Switch aria-labelledby="setup-password-title" aria-describedby="setup-access-description"
            isSelected={accessOn} onChange={setAccessOn} />
        </div>
        <Help>{lan || setup.docker ? '局域网访问推荐设置密码。未设置时，同一网络中能连接 Peach 的设备可直接进入。'
          : '只监听回环地址；设置密码后，打开 Peach 仍需登录。'}</Help>
        </>}
        {accessOn
          ? <PasswordPair label="访问密码" password={password} confirmation={confirmation}
              onPassword={setPassword} onConfirmation={setConfirmation}
              passwordError={announce(text(errors.access_password))} passwordHint="请输入 8–256 个字符。"
              confirmationInvalid={Boolean(errors.access_password)} />
          : null}
      </CardGroup>

      {/* Docker 的端口与局域网名由 Compose 决定，不出题，也算不出外部访问地址。 */}
      {setup.docker ? null : <CardGroup>
        <Disclosure key={advancedOpenings} summary="高级设置" defaultOpen={advancedOpenings > 0}>
          <div className="flex flex-col gap-4">{others.filter(visible).map(field)}</div>
        </Disclosure>
        <Help><span className="break-all">访问地址：{address}</span></Help>
      </CardGroup>}

      </div>
      <div hidden={step !== 3}>
      {failure ? <ErrorText>{failure}</ErrorText> : null}
      <CardGroup first labelledBy="setup-summary-title">
        <GroupTitle id="setup-summary-title">确认设置</GroupTitle>
        <FactList>
          <Fact term="数据目录"><span className="break-all">{dataRoot ? values[dataRoot.key] || '尚未填写' : setup.data_root || '未取得'}</span></Fact>
          <Fact term="访问范围">{setup.docker ? '按 Compose 端口映射' : lan ? '同一局域网的设备' : '只监听回环地址'} · {
            preset ? '已按 PEACH_ACCESS_PASSWORD 设置访问密码' : accessOn ? '使用访问密码' : '未设置访问密码'}</Fact>
        </FactList>
      </CardGroup>
      </div>
      </div>
      </div>
      <footer data-setup-footer="" data-setup-footer-end={step === 0 && !onRestore ? '' : undefined} key={step} data-copy-interact>
        {step > 0 ? <Button variant="ghost" onClick={() => { if (!busy) move(step - 1); }} aria-disabled={busy || undefined}>返回</Button>
          : onRestore ? <Button variant="ghost" onClick={onRestore}>使用已有数据</Button> : null}
        <Button type="submit" {...busyProps(busy)}>{step === 0 ? '开始设置' : step === 3 ? '完成设置' : '继续'}</Button>
      </footer>
    </form>
    </SetupShell>
  );
}
