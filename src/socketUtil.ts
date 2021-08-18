import event from "./event"
import { AttackDataStruct, AttackMsgStruct, EmitDataStruct, EmitMsgStruct, HomeMsgStruct, InitDataStruct, InitMsgStruct, MessageStruct, TurnType, UnionTurnStruct } from "./type"

let ws: WebSocket

let token: string

export const userInfo: { id: number } = {
  id: -1
}


export function goin(token: string) {
  console.log('进入房间 ', token)
  token = token
  ws.send(JSON.stringify({
    type: 'in',
    data: {
      token,
      maxSize: 2
    }
  }))
}
export function goout() {
  console.log('退出房间')
  ws.send(JSON.stringify({
    type: 'out',
    data: {
      // token,
    }
  }))
}
event.on('onHome', (data: HomeMsgStruct) => {
  if (data.data.users.length >= 3) {
    goout()
    alert('房间人数已满')
    location.reload()
  } else {
    event.emit('sendEveryOneMyHP')
  }
})

export function goInRoom() {
  ws = new WebSocket('wss://www.anxyser.xyz/qianserver')

  ws.onopen = (r) => {
    console.log('open', r)
    if (token !== undefined) {
      goin(token)
    }
  }

  ws.onmessage = ({ data: message }) => {
    const data = JSON.parse(message)
    console.log('message', data)
    switch (data.type) {
      case 'turn':
        turn(data as any)
        break;
      case 'init':
        init(data as any)
        break;
      case 'home':
        home(data as any)
        break;
    }
  }

  ws.onclose = () => {
    console.log('onClose')
    goInRoom()
  }

}

export function sendEmitArrow(data: Omit<EmitDataStruct, 'type'>) {
  console.log('send', data)
  ws.send(JSON.stringify({
    type: 'turn',
    data: { type: 'emit', ...data }
  }))
}

export function onAttack(data: Omit<AttackDataStruct, 'type'>) {
  console.log('send Attack')

  ws.send(JSON.stringify({
    type: 'turn',
    data: { type: 'attack', ...data }
  }))
}

export function turn(data: UnionTurnStruct) {
  console.log(data.from, userInfo.id, 123)
  if (data.from === userInfo.id) {
    return
  }
  event.emit('onTurn', data)
}

export function init(data: InitMsgStruct) {
  console.log('init', data.data)
  userInfo.id = data.data.id
}


export function home(data: HomeMsgStruct) {
  event.emit('onHome', data)
}

goInRoom()