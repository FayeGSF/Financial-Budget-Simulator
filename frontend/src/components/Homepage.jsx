import React from 'react';
import graphIcon from "../static/graphIcon.png"
import saving from "../static/saving.png"
import speechIcon from "../static/speechIcon.png"
import whatIfIcon from "../static/whatIfIcon.png"
import moneyBank from "../static/moneyBank.jpg"

function Homepage(){
    return (
     <div class="bg-lime-950 py-20">
       <div className="flex px-20 pb-20 gap-10 items-center ">
        <div className="flex flex-col w-1/2  ">
            <div className=" text-center font-bold text-6xl text-pretty text-neutral-100 sm:text-5xl lg:text-balance py-6">
            Your Goals, Your Pace
            </div>
            <div className="text-center pt-10 font-semibold text-6xl text-pretty text-neutral-100 sm:text-3xl lg:text-balance ">
            Plan smarter, save faster - simulate your path to any financial goal
            </div>
        </div>
        <div className="w-1/2 flex justify-center " >
            <img src={moneyBank} alt="money bank"   className="rounded-3xl w-3/4"/>
        </div>
        </div>
    
      <div class="mx-auto max-w-7xl px-6 lg:px-8 ">
        <div class="mx-auto max-w-2xl lg:text-center ">
          <p class="mt-2 text-4xl font-semibold tracking-tight text-pretty text-neutral-100 sm:text-5xl lg:text-balance">Everything you need to save </p>
          <p class="mt-6 text-lg/ text-zinc-300 font-medium">Transform your savings from wondering ‘What if?’ to knowing ‘How soon?’ using smart scenario planning.</p>
        </div>
    <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
      <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
        <div class="relative pl-16 bg-lime-200 rounded-md p-4 min-h-40">
          <dt class="text-lg font-bold text-neutral-700 pl-6">
            <div class="absolute top-3 left-2 flex size-14 items-center justify-center">
              <img src={graphIcon} alt="graph icon" className="w-12" />
            </div>
            Visual Goal Forecasting
          </dt>
          <dd class="mt-2 text-base/7  text-neutral-600 pl-6 text-pretty font-medium">
           Turn your savings data into clear, easy-to-read charts — and know exactly when you’ll cross the finish line.
          </dd>
        </div>
        <div class="relative pl-16 bg-lime-200 rounded-md p-4 min-h-40">
          <dt class="text-lg font-bold text-neutral-700 pl-6">
            <div class="absolute top-3 left-2 flex size-14 items-center justify-center">
              <img src={saving} alt="saving money" className="w-12"    />
            </div>
            Personalised Goal Intensity
          </dt>
          <dd class="mt-2 text-base/7 text-neutral-600 pl-6 text-pretty font-medium">
            Pick how quickly you want to reach your goal with three tailored intensity modes.
          </dd>
        </div>
        <div class="relative pl-16 bg-lime-200 rounded-md p-4 min-h-40">
          <dt class="text-lg font-bold text-neutral-700 pl-6">
            <div class="absolute top-3 left-2 flex size-14 items-center justify-center">
              <img src={speechIcon} alt="speech icon" className="w-12"  />
            </div>
            Tailored Suggestions
          </dt>
          <dd class="mt-2 text-base/7 text-neutral-600 pl-6 text-pretty font-medium">
            Receive customized recommendations to help you save faster.
          </dd>
        </div>
        <div class="relative pl-16 bg-lime-200 rounded-md p-4 min-h-40">
          <dt class="text-lg font-bold text-neutral-700 pl-6">
            <div class="absolute top-3 left-2 flex size-14 items-center justify-center">
              <img src={whatIfIcon} alt="what if" className="w-12"  />
            </div>
            Dynamic Scenario Simulation
          </dt>
          <dd class="mt-2 text-base/7 text-neutral-600 pl-6 text-pretty font-medium">
            Play with what‑if scenarios to see your savings timeline change.
          </dd>
        </div>
        </dl>
      </div>
    </div>
    </div>
    )
    
    }
    export default Homepage