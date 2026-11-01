#include <iostream>
#include<string>
using namespace std;

class Bank{
  string name;
  int balance;
  static int cnt;
  static int totalMoney;
  
  public:
  
  Bank(string name,int balance){
      this->name = name;
      this->balance = balance;
      cnt++;
      totalMoney +=balance;
  }
  
  void deposit(int amount){
      if(amount>0){
          balance+=amount;
          totalMoney+=amount;
      }
  }
  
  void withdrawl(int amount){
      if(amount<=balance){
          balance-=amount;
          totalMoney-=amount;
      }
  }
  
  void viewDetail(){
      cout<<name<<" "<<balance;
  }
  
  static void display(){
      cout<<cnt<<" "<<totalMoney;
  }
};

int Bank :: cnt=0;
int Bank :: totalMoney=0;

int main(){
    Bank c("akshat",1000);
    Bank d("Ram",20000);
    c.display();
}