"""
测试多功能工具箱应用
"""
from browser_use import Agent, Browser, ChatBrowserUse
import asyncio

async def main():
    browser = Browser()

    agent = Agent(
        task="打开 http://localhost:8000,检查页面是否正常加载,测试计算器功能是否正常工作",
        llm=ChatBrowserUse(),
        browser=browser,
    )
    await agent.run()

if __name__ == "__main__":
    asyncio.run(main())
