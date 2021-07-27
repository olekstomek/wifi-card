import QRCode from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

export const Card = ({ direction = 'ltr' }) => {
  const firstLoad = useRef(true);
  const [qrvalue, setQrvalue] = useState('');
  const sizeSmall = 175;
  const sizeMedium = 225;
  const sizeLarge = 275;
  const [size, setSize] = useState({
    size: sizeMedium,
    class: 'inputs-medium',
  });
  const [network, setNetwork] = useState({
    ssid: '',
    encryptionMode: 'WPA',
    password: '',
    hidePassword: false,
  });
  const [portrait, setPortrait] = useState(false);
  const { t } = useTranslation();
  const escape = (v) => {
    const needsEscape = ['"', ';', ',', ':', '\\'];

    let escaped = '';
    for (const c of v) {
      if (needsEscape.includes(c)) {
        escaped += `\\${c}`;
      } else {
        escaped += c;
      }
    }
    return escaped;
  };

  const inputsClassSize = () => {
    switch (size.size) {
      case sizeSmall:
        setSize({ ...size, class: 'inputs-small' });
        break;
      case sizeMedium:
        setSize({ ...size, class: 'inputs-medium' });
        break;
      case sizeLarge:
        setSize({ ...size, class: 'inputs-large' });
        break;
      default:
        setSize({ ...size, class: 'inputs-medium' });
        break;
    }
  };

  const onPrint = () => {
    if (network.ssid.length > 0) {
      if (network.password.length < 8 && network.encryptionMode === 'WPA') {
        alert(t('wifi.alert.password.length.8'));
      } else if (
        network.password.length < 5 &&
        network.encryptionMode === 'WEP'
      ) {
        alert(t('wifi.alert.password.length.5'));
      } else {
        document.title = 'WiFi Card - ' + network.ssid;
        window.print();
      }
    } else {
      alert(t('wifi.alert.name'));
    }
  };

  const disableHidePassword = () => {
    const isWEPWithPasswordLengthShorterThat5Characters = () => {
      return network.encryptionMode === 'WEP' && network.password.length < 5
        ? true
        : false;
    };

    return network.encryptionMode === 'WPA' && network.password.length < 8
      ? true
      : isWEPWithPasswordLengthShorterThat5Characters();
  };

  useEffect(() => {
    if (firstLoad.current && window.innerWidth < 500) {
      firstLoad.current = false;
      setPortrait(true);
    }

    inputsClassSize();

    const ssid = escape(network.ssid);
    const password = escape(network.password);
    setQrvalue(`WIFI:T:${network.encryptionMode};S:${ssid};P:${password};;`);
  }, [network, size.size]);

  return (
    <div>
      <fieldset
        id="print-area"
        style={{ maxWidth: portrait ? '350px' : '100%' }}
      >
        <h1 style={{ textAlign: portrait ? 'center' : 'unset' }}>
          {t('wifi.login')}
        </h1>

        <div
          className="details"
          style={{ flexDirection: portrait ? 'column' : 'row' }}
        >
          <QRCode
            className="qrcode"
            style={
              !portrait
                ? direction === 'ltr'
                  ? { paddingRight: '1em' }
                  : { paddingLeft: '1em' }
                : {}
            }
            value={qrvalue}
            size={size.size}
          />

          <div className={`inputs ${size.class}`}>
            <label>{t('wifi.name')}</label>
            <textarea
              id="ssid"
              type="text"
              maxLength="32"
              placeholder={t('wifi.name.placeholder')}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              value={network.ssid}
              onChange={(e) => setNetwork({ ...network, ssid: e.target.value })}
            />
            <label
              className={`
                ${network.hidePassword && 'no-print hidden'}
                ${network.encryptionMode === 'nopass' && 'hidden'}
              `}
            >
              {t('wifi.password')}
            </label>
            <textarea
              id="password"
              type="text"
              className={`
                ${network.hidePassword && 'no-print hidden'}
                ${network.encryptionMode === 'nopass' && 'hidden'}
              `}
              style={{
                height:
                  portrait || (!portrait && network.password.length > 40)
                    ? '5em'
                    : 'auto',
              }}
              maxLength="63"
              placeholder={t('wifi.password.placeholder')}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              value={network.password}
              onChange={(e) => {
                setNetwork({ ...network, password: e.target.value });
              }}
            />

            <div className="no-print">
              <input
                type="checkbox"
                id="hide-password-checkbox"
                disabled={disableHidePassword()}
                className={network.encryptionMode === 'nopass' ? 'hidden' : ''}
                onChange={() =>
                  setNetwork({
                    ...network,
                    hidePassword: !network.hidePassword,
                  })
                }
              />
              <label
                htmlFor="hide-password-checkbox"
                className={network.encryptionMode === 'nopass' ? 'hidden' : ''}
              >
                {t('wifi.password.hide')}
              </label>
            </div>

            <div className="no-print">
              <label>{t('wifi.password.encryption')}:</label>
              <input
                type="radio"
                name="encrypt-select"
                id="encrypt-none"
                value="nopass"
                onChange={(e) => {
                  setNetwork({
                    ...network,
                    encryptionMode: e.target.value,
                    password: '',
                  });
                }}
              />
              <label htmlFor="encrypt-none">None</label>
              <input
                type="radio"
                name="encrypt-select"
                id="encrypt-wpa-wpa2-wpa3"
                value="WPA"
                onChange={(e) =>
                  setNetwork({ ...network, encryptionMode: e.target.value })
                }
                defaultChecked
              />
              <label htmlFor="encrypt-wpa-wpa2-wpa3">WPA/WPA2/WPA3</label>
              <input
                type="radio"
                name="encrypt-select"
                id="encrypt-wep"
                value="WEP"
                onChange={(e) =>
                  setNetwork({ ...network, encryptionMode: e.target.value })
                }
              />
              <label htmlFor="encrypt-wep">WEP</label>
            </div>
            <div className="no-print">
              <label>{t('wifi.size')}:</label>
              <input
                type="radio"
                name="size-select"
                id="size-small"
                onChange={(e) => {
                  setSize({
                    ...size,
                    size: sizeSmall,
                  });
                }}
              />
              <label for="size-small">Small</label>
              <input
                type="radio"
                name="size-select"
                id="size-medium"
                onChange={(e) => {
                  setSize({ ...size, size: sizeMedium });
                }}
                defaultChecked
              />
              <label for="size-medium">Medium</label>
              <input
                type="radio"
                name="size-select"
                id="size-large"
                onChange={(e) => {
                  setSize({ ...size, size: sizeLarge });
                }}
              />
              <label for="size-large">Large</label>
            </div>
          </div>
        </div>
        <hr />
        <p>
          <span role="img" aria-label="mobile-phone">
            📸📱
          </span>
          {t('wifi.tip')}
        </p>
      </fieldset>

      <div className="buttons">
        <button id="rotate" onClick={() => setPortrait(!portrait)}>
          {t('button.rotate')}
        </button>
        <button id="print" onClick={onPrint}>
          {t('button.print')}
        </button>
      </div>
    </div>
  );
};
