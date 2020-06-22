library(rENA, warn.conflicts=F)
data(RS.data)

library(htmltools, warn.conflicts=F)
library(plotly, warn.conflicts=F)
library(dplyr, warn.conflicts=F)
library(lme4, warn.conflicts=F)

args <- commandArgs(TRUE)
color1 <- args[1]
color2 <- args[2]

#确定分析单位是在上/下半场游戏中的每个学生
units = RS.data[,c("Condition","UserName")]
head(units)

#确定会话是在上/下半场游戏中的每个小组的每次讨论活动
conversation = RS.data[,c("Condition","GroupName","ActivityNumber")]
head(conversation)

#确定讨论内容的编码方案，包括的编码有：数据、技术约束、性能参数、用户需求调查、设计推理、协作
codeCols = c(
  'Data','Technical.Constraints','Performance.Parameters',
  'Client.and.Consultant.Requests','Design.Reasoning','Collaboration'
)
codes = RS.data[,codeCols]
head(codes)

# optional
meta = RS.data[,c("CONFIDENCE.Change",
                  "CONFIDENCE.Pre","CONFIDENCE.Post","C.Change")]
head(meta)


#计算累计邻接向量，定义节的大小是7行
accum = ena.accumulate.data(
  units = units,
  conversation = conversation,
  codes = codes,
  metadata = meta,
  window.size.back = 7
)

###每个分析单位的邻接向量，即两两编码共现频次
head(accum$connection.counts)


#计算绘制网络图的相关参数
set = ena.make.set(
  enadata = accum
)

### 每个分析单位（的质心）在高维空间的坐标位置（坐标系是经过奇异值分解/主成分由大到小排列）
head(set$points)

### 每个编码在同一个高维空间的坐标位置
head(set$rotation$nodes)

### 每个分析单位的所有编码两两之间连线的权重（共现的频次）
head(set$line.weights)

### 上半场游戏的所有分析单位（学生）的质心坐标
first.game.points = as.matrix(set$points$Condition$FirstGame)

### 下半场半场的所有分析单位（学生）的质心坐标
second.game.points = as.matrix(set$points$Condition$SecondGame)

### 绘制上下半场游戏的所有学生网络图的质心
enaplot = ena.plot(set, scale.to = "points", title = "Groups of Units")  %>%
  ena.plot.points(points = first.game.points, colors = c(color1))  %>%
  ena.plot.points(points = second.game.points, colors = c(color2))

# htmlwidgets::saveWidget(enaplot$plot, file="./output.html")
setwd("../output")
htmlwidgets::saveWidget(enaplot$plot, file="./output.html")