"use client"

import { useCallback, useState } from "react";
import debounce  from "lodash.debounce"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Database } from "../../types/supabase";

const EMAIL_REGEX = /[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/

const verifyEmail = (email: string) => {
  console.log({ validation: EMAIL_REGEX.test(email)})
  return EMAIL_REGEX.test(email)
};

const debouncedVerifyEmail = debounce(verifyEmail, 10);

export default function SubscriptionField({
  className,
}: {
  className: string;
}) {
  const supabase = createClientComponentClient<Database>();
  const [mail, setMail] = useState<string>('')
  const [justSubscribed, setJustSubscribed] = useState(false)
  const [subscriptionDisabled, setSubscriptionDisabled] = useState(true)

  const onChange = (e: any) => {
    const value = e.target.value;
    setMail(value);

    // debouncedSendRequest is created once, so state caused re-renders won't affect it anymore
    const isValid = debouncedVerifyEmail(value);
    console.log({ isValid })

    setSubscriptionDisabled(!isValid)
  }

  const onSubscribe = useCallback(async () => {
    setSubscriptionDisabled(true)

    const { error } = await supabase.from('subscriptions').insert({
      email: mail,
    });

    if (!error)
      setJustSubscribed(true)

    setSubscriptionDisabled(false)
    setMail('')
  }, [mail])

  if (!justSubscribed) {
    return (
      <div className="flex flex-col py-10">
        <p>🎉 Congrats! You will receive everyday your daily dose of condensed news! 🎉 </p>
        <p>🙏 Thanks for supporting Sunrise Briefing 🙏</p>
      </div>
    )
  }

  return (
    <form className={'w-full max-w ' + className} noValidate>
      <div className="flex items-center border-b  text-gray-900 py-2">
        <input className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" type="email" placeholder="i-want-sunrise-briefing@mail.com" aria-label="Email" value={mail} onChange={onChange} />
        <button
          className="flex-shrink-0 bg-gray-900 hover:bg-gray-700 border-gray-900 hover:border-gray-700 text-sm border-4 text-white py-1 px-2 rounded"
          type="button"
          onClick={onSubscribe}
          disabled={subscriptionDisabled}
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}
