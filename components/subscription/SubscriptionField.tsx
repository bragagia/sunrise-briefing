'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

import { Database } from '../../types/supabase';

const EMAIL_REGEX = /[\w-.]+@([\w-]+.)+[\w-]{2,4}/;

const verifyEmail = (email: string) => {
  return EMAIL_REGEX.test(email);
};

export default function SubscriptionField({
  className,
}: {
  className: string;
}) {
  const supabase = createClientComponentClient<Database>();
  const [mail, setMail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [subscriptionDisabled, setSubscriptionDisabled] = useState(true);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const onChange = (e: any) => {
    const value = e.target.value;
    setMail(value);

    const isValid = verifyEmail(value);

    setSubscriptionDisabled(!isValid);
  };

  const onSubscribe = useCallback(async () => {
    setSubscriptionDisabled(true);
    setError('');

    if (!captchaRef.current) {
      setError('Internal error: Missing captcha ref');
      return;
    }
    captchaRef.current.execute();

    const token = captchaRef?.current?.getValue();

    if (token) {
      const res = await fetch(
        `${window.location.host}/api/verify-captcha-token`,
        {
          method: 'POST',
          body: JSON.stringify({
            token,
          }),
        }
      );

      const data = await res.json();

      if (!data.isValidToken) {
        setError(
          "Nous n'avons pas réussi à confirmer que vous n'êtes pas un robot."
        );
        return;
      }
    } else {
      setError("Veuillez d'abord prouver que vous n'êtes pas un robot.");
      return;
    }

    const { error } = await supabase.from('subscriptions').insert({
      email: mail,
    });

    if (!error) {
      setJustSubscribed(true);
      setMail('');
    } else {
      const message = error.message.includes('duplicate')
        ? 'Vous êtes déjà inscrit à notre newsletter! Profitez bien!'
        : "Quelque chose d'inattendu s'est produit! Veuillez réessayer.";

      setError(message);
    }

    setSubscriptionDisabled(false);
  }, [mail, supabase]);

  if (justSubscribed) {
    return (
      <div className="flex flex-col py-10">
        <p>
          🎉 Congrats! You will receive everyday your daily dose of condensed
          news! 🎉{' '}
        </p>
        <p>🙏 Thanks for supporting Sunrise Briefing 🙏</p>
      </div>
    );
  }

  const inputColor = error ? 'red' : 'gray';

  return (
    <form className={'w-full max-w ' + className} onSubmit={onSubscribe}>
      <div className="flex items-center border-b  text-gray-900 py-2">
        <input
          className={`appearance-none bg-transparent border-none w-full text-${inputColor}-700 mr-3 py-1 px-2 leading-tight focus:outline-none`}
          type="email"
          placeholder="i-want-sunrise-briefing@mail.com"
          aria-label="Email"
          value={mail}
          onChange={onChange}
        />
        <button
          className="flex-shrink-0 bg-gray-900 hover:bg-gray-700 border-gray-900 hover:border-gray-700 text-sm border-4 text-white disabled:bg-gray-400 disabled:border-gray-400  py-1 px-2 rounded"
          type="submit"
          onClick={onSubscribe}
          disabled={subscriptionDisabled}
        >
          Subscribe
        </button>
      </div>
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || ''}
        size="invisible"
        ref={captchaRef}
      />
      {error ? <p className="text-red-700 text-sm">{error}</p> : null}
    </form>
  );
}
