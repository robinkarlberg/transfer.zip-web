'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createContext, useMemo, useState } from 'react'

export const ProgressContext = createContext({})

export default function ProgressProvider({ steps, children }) {

  const pathname = usePathname()
  const router = useRouter()

  const stepIndex = useMemo(() => parseInt(pathname.split("/").pop()) || 0, [pathname])
  const [datas, setDatas] = useState(() => steps.map(() => undefined))

  const richSteps = useMemo(() => {
    return steps.map((s, i) => {
      let status = 'upcoming';
      if (i < stepIndex) status = 'complete';
      if (i === stepIndex) status = 'current';
      const data = datas[i]; // Retrieve the data for the current step
      return { ...s, status, data, index: i }; // Include the data and index in the returned object
    });
  }, [steps, stepIndex, datas]);

  const step = useMemo(() => richSteps[stepIndex], [richSteps, stepIndex])

  console.log(richSteps)

  const allDatas = useMemo(() => {
    return datas.reduce((acc, data) => {
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          acc[key] = value;
        });
      }
      return acc;
    }, {});
  }, [datas]);

  const setData = (index, newData) => {
    setDatas((prevDatas) => {
      const updatedDatas = [...prevDatas];
      updatedDatas[index] = { ...prevDatas[index], ...newData };
      return updatedDatas;
    });
  };

  const next = async (data) => {
    if (!data && !step.skippable) return

    setData(stepIndex, data)
    router.push(`${stepIndex + 1}`)
  };

  const prev = () => {
    router.push(`${stepIndex - 1}`)
  };

  const goTo = (index) => {
    // console.log(index)
    router.push(`${index}`)
  };

  return <ProgressContext.Provider value={{ steps: richSteps, stepIndex, step, allDatas, next, prev, goTo, setData }}>{children}</ProgressContext.Provider>
}