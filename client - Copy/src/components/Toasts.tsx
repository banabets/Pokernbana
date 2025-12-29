import React from 'react'

type Toast = { id: string, text: string }
const Ctx = React.createContext<{push:(t:string)=>void}>({push: ()=>{}})

export function useToasts(){
  return React.useContext(Ctx)
}

export default function ToastProvider({children}:{children:React.ReactNode}){
  const [list, setList] = React.useState<Toast[]>([])
  const push = (text: string)=>{
    const id = Math.random().toString(36).slice(2)
    setList(l=>[...l, {id, text}])
    setTimeout(()=> setList(l=> l.filter(x=>x.id!==id)), 3500)
  }
  return (
    <Ctx.Provider value={{push}}>
      {children}
      <div style={{position:'fixed', right:16, top:16, display:'grid', gap:8, zIndex:9999}}>
        {list.map(t=> (
          <div key={t.id} style={{background:'rgba(0,0,0,.6)', border:'1px solid rgba(255,255,255,.15)', color:'#fff', padding:'8px 12px', borderRadius:12, boxShadow:'0 6px 18px rgba(0,0,0,.35)'}}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
