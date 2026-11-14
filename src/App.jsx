import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

// WeChat Icon Component with enhanced design
const WeChatIcon = ({ size = 40 }) => (
  <div className="payment-icon-wrapper wechat-icon">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wechatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#07C160" stopOpacity="1"/>
          <stop offset="100%" stopColor="#06AD56" stopOpacity="1"/>
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#wechatGradient)" opacity="0.15"/>
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-5.418 2.264-7.763 1.705-1.914 4.24-3.015 7.07-3.015.276 0 .543.027.811.05C17.933 3.487 13.745 2.188 8.691 2.188zm-1.7 6.55c.712 0 1.29.577 1.29 1.29 0 .712-.578 1.29-1.29 1.29a1.293 1.293 0 0 1-1.29-1.29c0-.713.578-1.29 1.29-1.29zm5.16 0c.712 0 1.29.577 1.29 1.29 0 .712-.578 1.29-1.29 1.29a1.293 1.293 0 0 1-1.29-1.29c0-.713.578-1.29 1.29-1.29z" fill="url(#wechatGradient)"/>
      <path d="M18.785 5.3c-2.83 0-5.365 1.1-7.07 3.015-2.107 2.345-3.121 5.185-2.264 7.763.09.274.27.5.51.656a10.12 10.12 0 0 0 2.837.403c4.8 0 8.691-3.288 8.691-7.342 0-.712-.09-1.403-.27-2.066-.857.054-1.705.27-2.434.57zm-2.264 5.16c.543 0 .99-.447.99-.99s-.447-.99-.99-.99-.99.447-.99.99.447.99.99.99zm3.88 0c.543 0 .99-.447.99-.99s-.447-.99-.99-.99-.99.447-.99.99.447.99.99.99z" fill="url(#wechatGradient)"/>
    </svg>
  </div>
)

// Alipay Icon Component with enhanced design
const AlipayIcon = ({ size = 40 }) => (
  <div className="payment-icon-wrapper alipay-icon">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="alipayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1677FF" stopOpacity="1"/>
          <stop offset="100%" stopColor="#0958D9" stopOpacity="1"/>
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#alipayGradient)" opacity="0.15"/>
      <path d="M21.714 2.431H2.286A2.286 2.286 0 0 0 0 4.717v14.566a2.286 2.286 0 0 0 2.286 2.286h19.428A2.286 2.286 0 0 0 24 19.283V4.717a2.286 2.286 0 0 0-2.286-2.286zm-7.714 12.857h-1.714v1.714H9.714v-1.714H8v-1.714h1.714V12.43H8v-1.714h1.714V9.002h1.714v1.714h1.714V9.002h1.714v1.714H16v1.714h-1.714v1.144H16v1.714zm-1.714-3.428v1.714h-1.714v-1.714h1.714z" fill="url(#alipayGradient)"/>
      <path d="M12.286 12.43h1.714v1.714h-1.714V12.43z" fill="url(#alipayGradient)"/>
    </svg>
  </div>
)

function App() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showPrize, setShowPrize] = useState(false)
  const [prizeAmount, setPrizeAmount] = useState(0)
  const [paymentIcon, setPaymentIcon] = useState('wechat') // 'wechat' or 'alipay'
  const [fireworks, setFireworks] = useState([])
  const wheelRef = useRef(null)
  const spinTimeoutRef = useRef(null)
  const animationRef = useRef(null)
  const isSpinningRef = useRef(false)

  // 奖项配置：10元权重512，其后依次减半（9=256…1=1）
  // 颜色：10元起红橙黄绿青蓝紫，再接粉、深紫、靛蓝
  const prizes = [
    { amount: 1, probability: 1,   color: '#283593' }, // 靛蓝
    { amount: 2, probability: 2,   color: '#6A1B9A' }, // 深紫
    { amount: 3, probability: 4,   color: '#D81B60' }, // 粉
    { amount: 4, probability: 8,   color: '#8E24AA' }, // 紫
    { amount: 5, probability: 16,  color: '#1E88E5' }, // 蓝
    { amount: 6, probability: 32,  color: '#00ACC1' }, // 青
    { amount: 7, probability: 64,  color: '#43A047' }, // 绿
    { amount: 8, probability: 128, color: '#F9A825' }, // 黄
    { amount: 9, probability: 256, color: '#FB8C00' }, // 橙
    { amount: 10, probability: 512, color: '#E53935' } // 红
  ]

  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)

  // 按概率计算每个扇区的起止角度（从12点钟顺时针）
  let cumulativeAngle = 0
  const segments = prizes.map((prize) => {
    const sweep = (prize.probability / totalProbability) * 360
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + sweep
    const midAngle = startAngle + sweep / 2
    cumulativeAngle = endAngle
    return { ...prize, startAngle, endAngle, midAngle, sweep }
  })

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  const describeSegment = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  }

  // 根据概率选择奖项
  const selectPrize = () => {
    const random = Math.random() * totalProbability
    let currentSum = 0
    
    for (let i = 0; i < prizes.length; i++) {
      currentSum += prizes[i].probability
      if (random <= currentSum) {
        return i
      }
    }
    return 0
  }

  // 创建烟花效果
  const createFireworks = () => {
    const newFireworks = []
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3']
    
    for (let i = 0; i < 50; i++) {
      newFireworks.push({
        id: Math.random(),
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5 + 's'
      })
    }
    
    setFireworks(newFireworks)
    
    // 3秒后清除烟花
    setTimeout(() => {
      setFireworks([])
    }, 3000)
  }

  // 开始/停止转盘
  const handleSpin = () => {
    if (isSpinningRef.current) {
      // 停止转盘 - 开始减速过程
      isSpinningRef.current = false
      setIsSpinning(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // 选择奖项
      const selectedPrizeIndex = selectPrize()
      const selectedPrize = segments[selectedPrizeIndex]
      
      // 指针在12点钟方向，让选中扇区的中心对准指针
      const targetAngle = (360 - selectedPrize.midAngle) % 360
      
      // 计算当前角度（取模360）
      const currentAngle = ((rotation % 360) + 360) % 360
      
      // 计算需要转动的角度，至少再转1圈
      let angleDiff = targetAngle - currentAngle
      if (angleDiff <= 0) {
        angleDiff += 360
      }
      const finalRotation = rotation + 360 + angleDiff
      
      // 平滑减速动画
      let startRotation = rotation
      let targetRotation = finalRotation
      let startTime = Date.now()
      const duration = 2000 // 2秒减速时间
      
      const decelerate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用缓动函数实现平滑减速
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOut
        
        setRotation(currentRotation)
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(decelerate)
        } else {
          // 停止并显示结果
          setRotation(targetRotation)
          setTimeout(() => {
            setPrizeAmount(selectedPrize.amount)
            // Randomly select payment icon
            setPaymentIcon(Math.random() > 0.5 ? 'wechat' : 'alipay')
            setShowPrize(true)
            createFireworks()
          }, 300)
        }
      }
      
      decelerate()
    } else {
      // 开始转盘 - 开始加速过程
      isSpinningRef.current = true
      setIsSpinning(true)
      setShowPrize(false)
      
      let currentSpeed = 2 // 初始速度
      let accelerating = true
      
      const spin = () => {
        if (accelerating && currentSpeed < 15) {
          // 加速阶段
          currentSpeed += 0.3
        } else {
          accelerating = false
        }
        
        setRotation(prev => prev + currentSpeed)
        
        // 只有在仍在旋转状态时才继续
        if (isSpinningRef.current) {
          animationRef.current = requestAnimationFrame(spin)
        }
      }
      
      spin()
    }
  }

  // 关闭中奖弹窗
  const closePrizeModal = () => {
    setShowPrize(false)
    setFireworks([])
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="lottery-container">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8 header">
          🎰 小猪兜请抽奖 🎰
        </h1>
        
        <div className="relative">
          {/* 指针 */}
          <div className="wheel-pointer"></div>
          
          {/* 转盘：扇区大小按概率比例 */}
          <div 
            ref={wheelRef}
            className="lottery-wheel"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 300 300" className="wheel-svg">
              {segments.map((segment, index) => {
                const labelPos = polarToCartesian(150, 150, 105, segment.midAngle)
                const fontSize = segment.sweep >= 40 ? 16 : segment.sweep >= 20 ? 13 : 11
                return (
                  <g key={index}>
                    <path
                      d={describeSegment(150, 150, 150, segment.startAngle, segment.endAngle)}
                      fill={segment.color}
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      fill="#fff"
                      fontSize={fontSize}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
                    >
                      {segment.amount}元
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          
          {/* 中心按钮 */}
          <button 
            className="center-button"
            onClick={handleSpin}
            disabled={showPrize}
          >
            {isSpinning ? '停止' : '开始'}
          </button>
        </div>
        
        <div className="text-white text-center des">
          <p className="text-lg mb-2">本周表现不错</p>
          <p className="text-sm opacity-80">获得一次抽取红包奖励的机会</p>
        </div>
      </div>

      {/* 烟花效果 */}
      {fireworks.length > 0 && (
        <div className="fireworks">
          {fireworks.map((firework) => (
            <div
              key={firework.id}
              className="firework"
              style={{
                left: firework.left,
                top: firework.top,
                backgroundColor: firework.color,
                animationDelay: firework.delay
              }}
            />
          ))}
        </div>
      )}

      {/* 中奖弹窗 */}
      {showPrize && (
        <div className="prize-modal" onClick={closePrizeModal}>
          <div className="prize-content" onClick={(e) => e.stopPropagation()}>
            <div className="red-envelope">🧧</div>
            <h2 className="text-2xl font-bold mb-4">恭喜获得本周奖励</h2>
            <div className="prize-amount-wrapper">
              <div className="prize-amount flex items-center justify-center gap-3">
                <span className="amount-text">{prizeAmount}元</span>
                <span className="payment-icon-container">
                  {paymentIcon === 'wechat' ? (
                    <WeChatIcon size={40} />
                  ) : (
                    <AlipayIcon size={40} />
                  )}
                </span>
              </div>
            </div>
            <p className="text-lg mb-6">下周要继续努力哦！</p>
            <Button 
              onClick={closePrizeModal}
              className="bg-white text-red-500 hover:bg-gray-100 font-bold px-8 py-2"
            >
              亲妈妈一口领取
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

